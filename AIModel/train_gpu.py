# AIModel/train_gpu.py
import csv
import time
from pathlib import Path
import argparse

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, WeightedRandomSampler
from torchvision import datasets, transforms, models
from tqdm import tqdm

# torch 2.x AMP (new API)
from torch.amp import autocast, GradScaler


# -----------------------
# Utils
# -----------------------
def set_seed(seed: int = 42):
    import random
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)


def topk_acc(logits, y, k=1):
    topk = logits.topk(k, dim=1).indices
    return (topk == y.view(-1, 1)).any(dim=1).float().mean().item()


def confusion_matrix(preds, labels, num_classes):
    cm = torch.zeros((num_classes, num_classes), dtype=torch.int64)
    for p, t in zip(preds, labels):
        cm[t, p] += 1
    return cm


def mixup_data(x, y, alpha=0.2):
    if alpha <= 0:
        return x, y, y, 1.0
    lam = np.random.beta(alpha, alpha)
    batch_size = x.size(0)
    index = torch.randperm(batch_size, device=x.device)
    mixed_x = lam * x + (1 - lam) * x[index, :]
    y_a, y_b = y, y[index]
    return mixed_x, y_a, y_b, lam


def mixup_criterion(criterion, pred, y_a, y_b, lam):
    return lam * criterion(pred, y_a) + (1 - lam) * criterion(pred, y_b)


# -----------------------
# Optional: crop bottom to reduce ground objects (lamp posts, buildings, etc.)
# -----------------------
class SkyCrop:
    def __init__(self, crop_ratio: float):
        self.crop_ratio = float(crop_ratio)

    def __call__(self, img):
        if self.crop_ratio <= 0:
            return img
        w, h = img.size
        cut = int(h * self.crop_ratio)
        # remove bottom cut pixels
        return img.crop((0, 0, w, max(1, h - cut)))


# -----------------------
# Main
# -----------------------
def main():
    parser = argparse.ArgumentParser()

    # Speed/accuracy knobs
    parser.add_argument("--img", type=int, default=320, help="input image size")
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--batch", type=int, default=96)   # RTX3060(12GB) 기준 기본 96 추천
    parser.add_argument("--lr", type=float, default=3e-4)
    parser.add_argument("--mixup", type=float, default=0.2, help="mixup alpha (0 disables)")
    parser.add_argument("--seed", type=int, default=42)

    # DataLoader knobs (Windows에서 4가 오히려 안정/빠른 경우 많음)
    parser.add_argument("--num_workers", type=int, default=4)
    parser.add_argument("--prefetch", type=int, default=2)
    parser.add_argument("--sky_crop", type=float, default=0.25, help="crop bottom ratio, e.g. 0.25")

    # Augmentation mode: "light" is fastest and usually good enough
    parser.add_argument("--aug", type=str, default="light", choices=["light", "medium"],
                        help="light: fast / medium: a bit stronger but slower")

    args = parser.parse_args()

    set_seed(args.seed)

    PROJECT_DIR = Path(__file__).resolve().parent
    DATA_DIR = PROJECT_DIR / "splits" / "ccsn_split"
    OUT_DIR = PROJECT_DIR / "outputs"
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    pin_memory = torch.cuda.is_available()
    use_amp = torch.cuda.is_available()

    # cudnn benchmark: fixed image size일 때 속도 향상
    if torch.cuda.is_available():
        torch.backends.cudnn.benchmark = True

    print("✅ train_gpu.py started (FAST AUG + GPU OPT)", flush=True)
    print(f"📌 DATA_DIR: {DATA_DIR}", flush=True)
    print(f"🖥️ device: {device}", flush=True)
    print(
        f"⚙️ cfg: img={args.img} epochs={args.epochs} batch={args.batch} lr={args.lr} "
        f"mixup={args.mixup} aug={args.aug} workers={args.num_workers} prefetch={args.prefetch} sky_crop={args.sky_crop}",
        flush=True
    )

    sky = SkyCrop(args.sky_crop)

    # -----------------------
    # Transforms (Speed-optimized)
    # -----------------------
    # 핵심: RandomResizedCrop/ColorJitter/Autocontrast는 CPU 부하가 커서 속도를 크게 잡아먹음.
    # light는 "빠르면서도" 성능 괜찮은 쪽.
    if args.aug == "light":
        train_tf = transforms.Compose([
            sky,
            transforms.Resize(args.img),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225]),
        ])
    else:  # medium (조금 더 강하지만 느려짐)
        train_tf = transforms.Compose([
            sky,
            transforms.RandomResizedCrop(args.img, scale=(0.7, 1.0), ratio=(0.8, 1.25)),
            transforms.RandomHorizontalFlip(),
            transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.10, hue=0.02),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225]),
        ])

    val_tf = transforms.Compose([
        sky,
        transforms.Resize(int(args.img * 1.15)),
        transforms.CenterCrop(args.img),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225]),
    ])

    # -----------------------
    # Datasets
    # -----------------------
    train_ds = datasets.ImageFolder(DATA_DIR / "train", transform=train_tf)
    val_ds = datasets.ImageFolder(DATA_DIR / "val", transform=val_tf)
    test_ds = datasets.ImageFolder(DATA_DIR / "test", transform=val_tf)

    classes = train_ds.classes
    num_classes = len(classes)

    print(f"🧠 Classes({num_classes}): {classes}", flush=True)
    print(f"📦 Samples: train={len(train_ds)}, val={len(val_ds)}, test={len(test_ds)}", flush=True)

    # -----------------------
    # Class imbalance handling: WeightedRandomSampler
    # -----------------------
    class_counts = np.zeros(num_classes, dtype=np.int64)
    for _, y in train_ds.samples:
        class_counts[y] += 1

    print("\n=== Class counts (train) ===", flush=True)
    for i, c in enumerate(classes):
        print(f"{c:>3}: {class_counts[i]}", flush=True)

    sample_weights = np.array([1.0 / class_counts[y] for _, y in train_ds.samples], dtype=np.float64)
    sampler = WeightedRandomSampler(sample_weights, num_samples=len(sample_weights), replacement=True)

    # -----------------------
    # DataLoaders (Throughput tuning)
    # -----------------------
    # drop_last=True: 배치 크기 일정 -> GPU 효율이 좋아지는 경우 많음(특히 AMP)
    # non_blocking=True: pin_memory와 함께 쓸 때 전송이 더 효율적일 수 있음
    common_loader_kwargs = dict(
        num_workers=args.num_workers,
        pin_memory=pin_memory,
        persistent_workers=(args.num_workers > 0),
    )
    if args.num_workers > 0:
        common_loader_kwargs["prefetch_factor"] = args.prefetch

    train_loader = DataLoader(
        train_ds,
        batch_size=args.batch,
        sampler=sampler,
        drop_last=True,
        **common_loader_kwargs
    )
    val_loader = DataLoader(
        val_ds,
        batch_size=args.batch,
        shuffle=False,
        **common_loader_kwargs
    )
    test_loader = DataLoader(
        test_ds,
        batch_size=args.batch,
        shuffle=False,
        **common_loader_kwargs
    )

    # -----------------------
    # Model: ConvNeXt Tiny
    # -----------------------
    model = models.convnext_tiny(weights=models.ConvNeXt_Tiny_Weights.IMAGENET1K_V1)
    model.classifier[2] = nn.Linear(model.classifier[2].in_features, num_classes)
    model.to(device)

    # Loss/Optim/Scheduler
    crit = nn.CrossEntropyLoss(label_smoothing=0.1)
    opt = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=0.05)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=args.epochs)

    scaler = GradScaler(enabled=use_amp)

    # -----------------------
    # Logging / Output paths
    # -----------------------
    run_name = f"convnext_img{args.img}_e{args.epochs}_b{args.batch}_mix{args.mixup}_crop{args.sky_crop}_aug{args.aug}"
    log_path = OUT_DIR / f"train_log_{run_name}.csv"
    best_path = OUT_DIR / f"cloud_model_{run_name}.pt"
    last_path = OUT_DIR / f"cloud_model_{run_name}_last.pt"
    cm_path = OUT_DIR / f"confusion_matrix_{run_name}.csv"

    with open(log_path, "w", newline="", encoding="utf-8") as f:
        csv.writer(f).writerow(["epoch", "lr", "train_loss", "val_loss", "val_top1", "val_top3", "sec"])

    print(f"\n📝 logging to: {log_path}", flush=True)

    best_val = 0.0

    # -----------------------
    # Train loop (Ctrl+C safe)
    # -----------------------
    try:
        for epoch in range(1, args.epochs + 1):
            t0 = time.time()

            model.train()
            tr_loss_sum = 0.0

            train_bar = tqdm(train_loader, desc=f"Epoch {epoch}/{args.epochs} [train]")
            for x, y in train_bar:
                x = x.to(device, non_blocking=True)
                y = y.to(device, non_blocking=True)

                if args.mixup > 0:
                    x, y_a, y_b, lam = mixup_data(x, y, alpha=args.mixup)
                else:
                    y_a, y_b, lam = y, y, 1.0

                opt.zero_grad(set_to_none=True)

                with autocast(device_type="cuda", enabled=use_amp):
                    logits = model(x)
                    loss = mixup_criterion(crit, logits, y_a, y_b, lam) if args.mixup > 0 else crit(logits, y)

                scaler.scale(loss).backward()
                scaler.step(opt)
                scaler.update()

                tr_loss_sum += loss.item() * x.size(0)
                train_bar.set_postfix(loss=f"{loss.item():.4f}", lr=f"{opt.param_groups[0]['lr']:.2e}")

            train_loss = tr_loss_sum / max(1, len(train_ds))

            # Validation
            model.eval()
            val_loss_sum = 0.0
            acc1_sum = 0.0
            acc3_sum = 0.0

            with torch.no_grad():
                val_bar = tqdm(val_loader, desc=f"Epoch {epoch}/{args.epochs} [val]")
                for x, y in val_bar:
                    x = x.to(device, non_blocking=True)
                    y = y.to(device, non_blocking=True)
                    with autocast(device_type="cuda", enabled=use_amp):
                        logits = model(x)
                        loss = crit(logits, y)

                    val_loss_sum += loss.item() * x.size(0)
                    acc1_sum += topk_acc(logits, y, k=1) * x.size(0)
                    acc3_sum += topk_acc(logits, y, k=3) * x.size(0)

            val_loss = val_loss_sum / max(1, len(val_ds))
            val_top1 = acc1_sum / max(1, len(val_ds))
            val_top3 = acc3_sum / max(1, len(val_ds))

            scheduler.step()
            elapsed = time.time() - t0

            print(
                f"[{epoch:02d}/{args.epochs}] lr={opt.param_groups[0]['lr']:.2e} "
                f"train_loss={train_loss:.4f} val_loss={val_loss:.4f} "
                f"top1={val_top1:.3f} top3={val_top3:.3f} ({elapsed:.1f}s)",
                flush=True
            )

            with open(log_path, "a", newline="", encoding="utf-8") as f:
                csv.writer(f).writerow([epoch, opt.param_groups[0]["lr"], train_loss, val_loss, val_top1, val_top3, elapsed])

            # save "last" checkpoint each epoch (so Ctrl+C won't waste progress)
            torch.save(
                {"model_state": model.state_dict(), "classes": classes, "img_size": args.img, "arch": "convnext_tiny", "run_name": run_name},
                last_path
            )

            # save best
            if val_top1 > best_val:
                best_val = val_top1
                torch.save(
                    {"model_state": model.state_dict(), "classes": classes, "img_size": args.img, "arch": "convnext_tiny", "run_name": run_name},
                    best_path
                )
                print(f"✅ saved best model -> {best_path} (best_val={best_val:.3f})", flush=True)

    except KeyboardInterrupt:
        print("\n🛑 Training interrupted by user (Ctrl+C). Last checkpoint is saved.", flush=True)

    # -----------------------
    # Test best model + confusion matrix
    # -----------------------
    if best_path.exists():
        print("\n=== TESTING BEST MODEL ===", flush=True)
        ckpt = torch.load(best_path, map_location=device)
        model.load_state_dict(ckpt["model_state"])
        model.eval()

        all_preds, all_labels = [], []
        test_acc1_sum, test_acc3_sum = 0.0, 0.0

        with torch.no_grad():
            test_bar = tqdm(test_loader, desc="Test")
            for x, y in test_bar:
                x = x.to(device, non_blocking=True)
                y = y.to(device, non_blocking=True)
                with autocast(device_type="cuda", enabled=use_amp):
                    logits = model(x)

                test_acc1_sum += topk_acc(logits, y, k=1) * x.size(0)
                test_acc3_sum += topk_acc(logits, y, k=3) * x.size(0)

                all_preds.append(logits.argmax(1).cpu())
                all_labels.append(y.cpu())

        test_top1 = test_acc1_sum / max(1, len(test_ds))
        test_top3 = test_acc3_sum / max(1, len(test_ds))
        print(f"TEST top1={test_top1:.3f} top3={test_top3:.3f}", flush=True)

        cm = confusion_matrix(torch.cat(all_preds), torch.cat(all_labels), num_classes=num_classes).numpy()
        with open(cm_path, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["true\\pred"] + classes)
            for i, row in enumerate(cm):
                w.writerow([classes[i]] + row.tolist())

        print(f"📌 saved confusion matrix -> {cm_path}", flush=True)


if __name__ == "__main__":
    main()
