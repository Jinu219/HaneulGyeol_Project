# train.py (CPU FAST VERSION)
import csv
import time
from pathlib import Path

import torch
import torch.nn as nn
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import numpy as np
from tqdm import tqdm

# ======================
# Utils
# ======================
def topk_acc(logits, y, k=1):
    topk = logits.topk(k, dim=1).indices
    return (topk == y.view(-1, 1)).any(dim=1).float().mean().item()

def confusion_matrix(preds, labels, num_classes):
    cm = torch.zeros((num_classes, num_classes), dtype=torch.int64)
    for p, t in zip(preds, labels):
        cm[t, p] += 1
    return cm

# ======================
# Main
# ======================
def main():
    PROJECT_DIR = Path(__file__).resolve().parent
    DATA_DIR = PROJECT_DIR / "splits" / "ccsn_split"
    OUT_DIR = PROJECT_DIR / "outputs"
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # ======================
    # Hyperparameters (FAST)
    # ======================
    batch_size = 16
    epochs = 3
    lr = 3e-4
    num_workers = 0   # Windows 안정성
    device = "cuda" if torch.cuda.is_available() else "cpu"
    pin_memory = torch.cuda.is_available()

    print("✅ train.py started (FAST CPU MODE)", flush=True)
    print(f"📌 DATA_DIR: {DATA_DIR}", flush=True)
    print(f"🖥️ device: {device}", flush=True)

    # ======================
    # Transforms (FAST)
    # ======================
    train_tf = transforms.Compose([
        transforms.RandomResizedCrop(192, scale=(0.8, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
    ])

    val_tf = transforms.Compose([
        transforms.Resize(224),
        transforms.CenterCrop(192),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
    ])

    # ======================
    # Dataset
    # ======================
    train_ds = datasets.ImageFolder(DATA_DIR / "train", transform=train_tf)
    val_ds   = datasets.ImageFolder(DATA_DIR / "val", transform=val_tf)
    test_ds  = datasets.ImageFolder(DATA_DIR / "test", transform=val_tf)

    num_classes = len(train_ds.classes)
    print(f"🧠 Classes({num_classes}): {train_ds.classes}", flush=True)
    print(
        f"📦 Samples: train={len(train_ds)}, "
        f"val={len(val_ds)}, test={len(test_ds)}",
        flush=True
    )

    # ======================
    # DataLoader
    # ======================
    train_loader = DataLoader(
        train_ds, batch_size=batch_size, shuffle=True,
        num_workers=num_workers, pin_memory=pin_memory
    )
    val_loader = DataLoader(
        val_ds, batch_size=batch_size, shuffle=False,
        num_workers=num_workers, pin_memory=pin_memory
    )
    test_loader = DataLoader(
        test_ds, batch_size=batch_size, shuffle=False,
        num_workers=num_workers, pin_memory=pin_memory
    )

    # ======================
    # Model (FAST)
    # ======================
    model = models.resnet18(
        weights=models.ResNet18_Weights.IMAGENET1K_V1
    )
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    model = model.to(device)

    # ======================
    # Class weights
    # ======================
    class_counts = np.zeros(num_classes, dtype=np.int64)
    for _, y in train_ds.samples:
        class_counts[y] += 1

    print("\n=== Class counts (train) ===", flush=True)
    for i, c in enumerate(train_ds.classes):
        print(f"{c:>3}: {class_counts[i]}", flush=True)

    class_weights = (class_counts.sum() / (class_counts + 1e-9))
    class_weights = class_weights / class_weights.mean()
    class_weights = torch.tensor(
        class_weights, dtype=torch.float32
    ).to(device)

    crit = nn.CrossEntropyLoss(weight=class_weights)
    opt = torch.optim.AdamW(model.parameters(), lr=lr)

    # ======================
    # Logging
    # ======================
    log_path = OUT_DIR / "train_log_fast.csv"
    with open(log_path, "w", newline="", encoding="utf-8") as f:
        csv.writer(f).writerow(
            ["epoch", "train_loss", "val_loss", "val_top1", "val_top3", "sec"]
        )

    best_val = 0.0
    best_path = OUT_DIR / "cloud_model_fast.pt"

    # ======================
    # Train loop
    # ======================
    for epoch in range(1, epochs + 1):
        t0 = time.time()

        model.train()
        tr_loss_sum = 0.0

        for x, y in tqdm(
            train_loader, desc=f"Epoch {epoch}/{epochs} [train]"
        ):
            x, y = x.to(device), y.to(device)
            opt.zero_grad(set_to_none=True)
            logits = model(x)
            loss = crit(logits, y)
            loss.backward()
            opt.step()
            tr_loss_sum += loss.item() * x.size(0)

        tr_loss = tr_loss_sum / len(train_ds)

        # ---- validation ----
        model.eval()
        val_loss_sum = 0.0
        acc1_sum = 0.0
        acc3_sum = 0.0

        with torch.no_grad():
            for x, y in tqdm(
                val_loader, desc=f"Epoch {epoch}/{epochs} [val]"
            ):
                x, y = x.to(device), y.to(device)
                logits = model(x)
                loss = crit(logits, y)

                val_loss_sum += loss.item() * x.size(0)
                acc1_sum += topk_acc(logits, y, k=1) * x.size(0)
                acc3_sum += topk_acc(logits, y, k=3) * x.size(0)

        val_loss = val_loss_sum / len(val_ds)
        acc1 = acc1_sum / len(val_ds)
        acc3 = acc3_sum / len(val_ds)

        elapsed = time.time() - t0
        print(
            f"[{epoch}/{epochs}] "
            f"train_loss={tr_loss:.4f} "
            f"val_loss={val_loss:.4f} "
            f"top1={acc1:.3f} top3={acc3:.3f} "
            f"({elapsed:.1f}s)",
            flush=True
        )

        with open(log_path, "a", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow(
                [epoch, tr_loss, val_loss, acc1, acc3, elapsed]
            )

        if acc1 > best_val:
            best_val = acc1
            torch.save(
                {"model": model.state_dict(), "classes": train_ds.classes},
                best_path
            )
            print(f"✅ saved best model -> {best_path}", flush=True)

    # ======================
    # Test
    # ======================
    print("\n=== TESTING BEST MODEL ===", flush=True)
    ckpt = torch.load(best_path, map_location=device)
    model.load_state_dict(ckpt["model"])
    model.eval()

    all_preds, all_labels = [], []
    acc1_sum, acc3_sum = 0.0, 0.0

    with torch.no_grad():
        for x, y in tqdm(test_loader, desc="Test"):
            x, y = x.to(device), y.to(device)
            logits = model(x)
            acc1_sum += topk_acc(logits, y, k=1) * x.size(0)
            acc3_sum += topk_acc(logits, y, k=3) * x.size(0)
            all_preds.append(logits.argmax(1).cpu())
            all_labels.append(y.cpu())

    acc1 = acc1_sum / len(test_ds)
    acc3 = acc3_sum / len(test_ds)
    print(f"TEST top1={acc1:.3f} top3={acc3:.3f}", flush=True)

    cm = confusion_matrix(
        torch.cat(all_preds),
        torch.cat(all_labels),
        num_classes
    )
    print("\nConfusion Matrix:")
    print(cm.numpy())

if __name__ == "__main__":
    main()
