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


def topk_acc(logits, y, k=1):
    topk = logits.topk(k, dim=1).indices
    return (topk == y.view(-1, 1)).any(dim=1).float().mean().item()


def confusion_matrix(preds, labels, num_classes):
    cm = torch.zeros((num_classes, num_classes), dtype=torch.int64)
    for p, t in zip(preds, labels):
        cm[t, p] += 1
    return cm


def set_seed(seed: int = 42):
    import random
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)


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


# 하단 sky_crop 비율만큼 잘라서 하늘 비율 높이기(선택)
class SkyCrop:
    def __init__(self, crop_ratio: float):
        self.crop_ratio = float(crop_ratio)

    def __call__(self, img):
        if self.crop_ratio <= 0:
            return img
        w, h = img.size
        cut = int(h * self.crop_ratio)
        # 하단 cut 제거
        return img.crop((0, 0, w, h - cut))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--img", type=int, default=320)
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--batch", type=int, default=64)
    parser.add_argument("--lr", type=float, default=3e-4)
    parser.add_argument("--mixup", type=float, default=0.2)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--num_workers", type=int, default=8)
    parser.add_argument("--sky_crop", type=float, default=0.0, help="crop bottom ratio (0~0.4 recommended)")
    args = parser.parse_args()

    set_seed(args.seed)

    PROJECT_DIR = Path(__file__).resolve().parent
    DATA_DIR = PROJECT_DIR / "splits" / "ccsn_split"
    OUT_DIR = PROJECT_DIR / "outputs"
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    pin_memory = torch.cuda.is_available()

    # 성능 최적화(특히 고정 입력 크기일 때)
    torch.backends.cudnn.benchmark = True

    print("✅ train_gpu.py started (FAST PIPELINE)", flush=True)
    print(f"📌 DATA_DIR: {DATA_DIR}", flush=True)
    print(f"🖥️ device: {device}", flush=True)
    print(f"⚙️ cfg: img={args.img} epochs={args.epochs} batch={args.batch} lr={args.lr} mixup={args.mixup} workers={args.num_workers} sky_crop={args.sky_crop}", flush=True)

    # Transforms
    sky = SkyCrop(args.sky_crop)

    train_tf = transforms.Compose([
        sky,
        transforms.RandomResizedCrop(args.img, scale=(0.6, 1.0), ratio=(0.75, 1.33)),
        transforms.RandomHorizontalFlip(),
        transforms.ColorJitter(brightness=0.25, contrast=0.25, saturation=0.15, hue=0.03),
        transforms.RandomAutocontrast(p=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]),
    ])

    val_tf = transforms.Compose([
        sky,
        transforms.Resize(int(args.img * 1.15)),
        transforms.CenterCrop(args.img),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]),
    ])

    train_ds = datasets.ImageFolder(DATA_DIR / "train", transform=train_tf)
    val_ds   = datasets.ImageFolder(DATA_DIR / "val", transform=val_tf)
    test_ds  = datasets.ImageFolder(DATA_DIR / "test", transform=val_tf)

    classes = train_ds.classes
    num_classes = len(classes)

    print(f"🧠 Classes({num_classes}): {classes}", flush=True)
    print(f"📦 Samples: train={len(train_ds)}, val={len(val_ds)}, test={len(test_ds)}", flush=True)

    # imbalance -> sampler
    class_counts = np.zeros(num_classes, dtype=np.int64)
    for _, y in train_ds.samples:
        class_counts[y] += 1
    sample_weights = np.array([1.0 / class_counts[y] for _, y in train_ds.samples], dtype=np.float64)
    sampler = WeightedRandomSampler(sample_weights, num_samples=len(sample_weights), replacement=True)

    # DataLoaders (속도 핵심: workers + prefetch_factor)
    train_loader = DataLoader(
        train_ds, batch_size=args.batch, sampler=sampler,
        num_workers=args.num_workers, pin_memory=pin_memory,
        persistent_workers=(args.num_workers > 0),
        prefetch_factor=2 if args.num_workers > 0 else None,
        drop_last=True
    )
    val_loader = DataLoader(
        val_ds, batch_size=args.batch, shuffle=False,
        num_workers=args.num_workers, pin_memory=pin_memory,
        persistent_workers=(args.num_workers > 0),
        prefetch_factor=2 if args.num_workers > 0 else None
    )
    test_loader = DataLoader(
        test_ds, batch_size=args.batch, shuffle=False,
        num_workers=args.num_workers, pin_memory=pin_memory,
        persistent_workers=(args.num_workers > 0),
        prefetch_factor=2 if args.num_workers > 0 else None
    )

    # Model
    model = models.convnext_tiny(weights=models.ConvNeXt_Tiny_Weights.IMAGENET1K_V1)
    model.classifier[2] = nn.Linear(model.classifier[2].in_features, num_classes)
    model.to(device)

    crit = nn.CrossEntropyLoss(label_smoothing=0.1)
    opt = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=0.05)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=args.epochs)

    use_amp = torch.cuda.is_available()
    scaler = torch.cuda.amp.GradScaler(enabled=use_amp)

    run_name = f"convnext_img{args.img}_e{args.epochs}_b{args.batch}_mix{args.mixup}_crop{args.sky_crop}"
    log_path = OUT_DIR / f"train_log_{run_name}.csv"
    best_path = OUT_DIR / f"cloud_model_{run_name}.pt"
    last_path = OUT_DIR / f"cloud_model_{run_name}_last.pt"
    cm_path = OUT_DIR / f"confusion_matrix_{run_name}.csv"

    with open(log_path, "w", newline="", encoding="utf-8") as f:
        csv.writer(f).writerow(["epoch", "lr", "train_loss", "val_loss", "val_top1", "val_top3", "sec"])

    print(f"📝 logging to: {log_path}", flush=True)

    best_val = 0.0

    try:
        for epoch in range(1, args.epochs + 1):
            t0 = time.time()
            model.train()
            tr_loss_sum = 0.0

            train_bar = tqdm(train_loader, desc=f"Epoch {epoch}/{args.epochs} [train]")
            for x, y in train_bar:
                x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)

                if args.mixup > 0:
                    x, y_a, y_b, lam = mixup_data(x, y, alpha=args.mixup)
                else:
                    y_a, y_b, lam = y, y, 1.0

                opt.zero_grad(set_to_none=True)

                with torch.cuda.amp.autocast(enabled=use_amp):
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
                    x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
                    with torch.cuda.amp.autocast(enabled=use_amp):
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

            # save last every epoch
            torch.save(
                {"model_state": model.state_dict(), "classes": classes, "img_size": args.img, "arch": "convnext_tiny", "run_name": run_name},
                last_path
            )

            if val_top1 > best_val:
                best_val = val_top1
                torch.save(
                    {"model_state": model.state_dict(), "classes": classes, "img_size": args.img, "arch": "convnext_tiny", "run_name": run_name},
                    best_path
                )
                print(f"✅ saved best model -> {best_path} (best_val={best_val:.3f})", flush=True)

    except KeyboardInterrupt:
        print("\n🛑 Training interrupted by user (Ctrl+C). Last checkpoint is saved.", flush=True)

    # Test best (if exists)
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
                x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
                with torch.cuda.amp.autocast(enabled=use_amp):
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
