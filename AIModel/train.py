# train.py (FULL)
import os
from pathlib import Path
import csv
import time

import torch
import torch.nn as nn
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import numpy as np
from tqdm import tqdm

def topk_acc(logits, y, k=1):
    topk = logits.topk(k, dim=1).indices
    return (topk == y.view(-1, 1)).any(dim=1).float().mean().item()

def confusion_matrix(preds, labels, num_classes):
    cm = torch.zeros((num_classes, num_classes), dtype=torch.int64)
    for p, t in zip(preds, labels):
        cm[t, p] += 1
    return cm

def save_cm_csv(cm: np.ndarray, classes, out_path: Path):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["true\\pred"] + classes)
        for i, row in enumerate(cm):
            w.writerow([classes[i]] + row.tolist())

def main():
    PROJECT_DIR = Path(__file__).resolve().parent
    DATA_DIR = PROJECT_DIR / "splits" / "ccsn_split"
    OUT_DIR = PROJECT_DIR / "outputs"
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # ===== 하이퍼파라미터 =====
    batch_size = 32
    epochs = 12
    lr = 3e-4

    # Windows에서 DataLoader 멈춤 방지: 0 추천
    num_workers = 0

    device = "cuda" if torch.cuda.is_available() else "cpu"
    pin_memory = torch.cuda.is_available()  # GPU 있을 때만 True

    # ===== 시작 로그 =====     
    print("✅ train.py started", flush=True)
    print(f"📌 DATA_DIR: {DATA_DIR}", flush=True)
    print(f"🖥️ device: {device}", flush=True)

    # ===== Transform =====
    train_tf = transforms.Compose([
        transforms.RandomResizedCrop(224, scale=(0.7, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1, hue=0.02),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    val_tf = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    # ===== Dataset =====
    train_ds = datasets.ImageFolder(DATA_DIR / "train", transform=train_tf)
    val_ds   = datasets.ImageFolder(DATA_DIR / "val", transform=val_tf)
    test_ds  = datasets.ImageFolder(DATA_DIR / "test", transform=val_tf)

    num_classes = len(train_ds.classes)
    print(f"🧠 Classes({num_classes}): {train_ds.classes}", flush=True)
    print(f"📦 Samples: train={len(train_ds)}, val={len(val_ds)}, test={len(test_ds)}", flush=True)

    # ===== DataLoader =====
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

    # ===== 모델 =====
    model = models.convnext_tiny(weights=models.ConvNeXt_Tiny_Weights.IMAGENET1K_V1)
    model.classifier[2] = nn.Linear(model.classifier[2].in_features, num_classes)
    model = model.to(device)

    # ===== 클래스 불균형 완화: class weight =====
    class_counts = np.zeros(num_classes, dtype=np.int64)
    for _, y in train_ds.samples:
        class_counts[y] += 1

    # 출력(불균형 확인)
    print("\n=== Class counts (train) ===", flush=True)
    for i, c in enumerate(train_ds.classes):
        print(f"{c:>3}: {class_counts[i]}", flush=True)

    class_weights = (class_counts.sum() / (class_counts + 1e-9))
    class_weights = class_weights / class_weights.mean()
    class_weights = torch.tensor(class_weights, dtype=torch.float32).to(device)

    crit = nn.CrossEntropyLoss(weight=class_weights)
    opt = torch.optim.AdamW(model.parameters(), lr=lr)

    best_val = 0.0
    best_path = OUT_DIR / "cloud_model.pt"

    # 로그 파일
    log_path = OUT_DIR / "train_log.csv"
    with open(log_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["epoch", "train_loss", "val_loss", "val_top1", "val_top3", "elapsed_sec"])
    print(f"\n📝 logging to: {log_path}", flush=True)

    # ===== Train loop =====
    for epoch in range(1, epochs + 1):
        t0 = time.time()

        model.train()
        tr_loss_sum = 0.0

        train_bar = tqdm(train_loader, desc=f"Epoch {epoch}/{epochs} [train]", leave=False)
        for x, y in train_bar:
            x, y = x.to(device), y.to(device)

            opt.zero_grad(set_to_none=True)
            logits = model(x)
            loss = crit(logits, y)
            loss.backward()
            opt.step()

            tr_loss_sum += loss.item() * x.size(0)
            train_bar.set_postfix(loss=f"{loss.item():.4f}")

        tr_loss = tr_loss_sum / max(1, len(train_ds))

        # ===== Validation =====
        model.eval()
        val_loss_sum = 0.0
        acc1_sum = 0.0
        acc3_sum = 0.0

        val_bar = tqdm(val_loader, desc=f"Epoch {epoch}/{epochs} [val]", leave=False)
        with torch.no_grad():
            for x, y in val_bar:
                x, y = x.to(device), y.to(device)
                logits = model(x)
                loss = crit(logits, y)

                val_loss_sum += loss.item() * x.size(0)
                acc1_sum += topk_acc(logits, y, k=1) * x.size(0)
                acc3_sum += topk_acc(logits, y, k=3) * x.size(0)

        val_loss = val_loss_sum / max(1, len(val_ds))
        acc1 = acc1_sum / max(1, len(val_ds))
        acc3 = acc3_sum / max(1, len(val_ds))

        elapsed = time.time() - t0
        print(
            f"[{epoch:02d}/{epochs}] train_loss={tr_loss:.4f} "
            f"val_loss={val_loss:.4f} top1={acc1:.3f} top3={acc3:.3f} "
            f"({elapsed:.1f}s)",
            flush=True
        )

        # 로그 저장
        with open(log_path, "a", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow([epoch, f"{tr_loss:.6f}", f"{val_loss:.6f}", f"{acc1:.6f}", f"{acc3:.6f}", f"{elapsed:.2f}"])

        # best 모델 저장
        if acc1 > best_val:
            best_val = acc1
            torch.save({"model_state": model.state_dict(), "classes": train_ds.classes}, best_path)
            print(f"✅ saved best model -> {best_path} (best_val={best_val:.3f})", flush=True)

    # ===== Test + Confusion Matrix =====
    print("\n=== Testing best model ===", flush=True)
    ckpt = torch.load(best_path, map_location=device)
    model.load_state_dict(ckpt["model_state"])
    model.eval()

    all_preds = []
    all_labels = []
    test_acc1_sum = 0.0
    test_acc3_sum = 0.0

    test_bar = tqdm(test_loader, desc="Test", leave=False)
    with torch.no_grad():
        for x, y in test_bar:
            x, y = x.to(device), y.to(device)
            logits = model(x)

            test_acc1_sum += topk_acc(logits, y, k=1) * x.size(0)
            test_acc3_sum += topk_acc(logits, y, k=3) * x.size(0)

            preds = logits.argmax(dim=1)
            all_preds.append(preds.cpu())
            all_labels.append(y.cpu())

    test_acc1 = test_acc1_sum / max(1, len(test_ds))
    test_acc3 = test_acc3_sum / max(1, len(test_ds))
    print(f"TEST top1={test_acc1:.3f} top3={test_acc3:.3f}", flush=True)

    all_preds = torch.cat(all_preds)
    all_labels = torch.cat(all_labels)
    cm = confusion_matrix(all_preds, all_labels, num_classes=num_classes).numpy()

    print("\nConfusion Matrix (rows=true, cols=pred):", flush=True)
    print(cm, flush=True)

    # cm 저장
    cm_path = OUT_DIR / "confusion_matrix.csv"
    save_cm_csv(cm, train_ds.classes, cm_path)
    print(f"📌 saved confusion matrix -> {cm_path}", flush=True)

if __name__ == "__main__":
    main()
