# AIModel/model_loader.py
from pathlib import Path
import torch
import torch.nn as nn
from torchvision import models

def load_model():
    device = "cuda" if torch.cuda.is_available() else "cpu"

    ckpt_path = Path(__file__).parent / "outputs" / "cloud_model_best.pt"
    if not ckpt_path.exists():
        raise FileNotFoundError(f"Checkpoint not found: {ckpt_path}")

    ckpt = torch.load(ckpt_path, map_location=device)

    classes = ckpt.get("classes")
    if classes is None:
        raise RuntimeError("Checkpoint does not contain 'classes'")

    num_classes = len(classes)

    model = models.convnext_tiny(weights=None)
    model.classifier[2] = nn.Linear(
        model.classifier[2].in_features, num_classes
    )
    model.load_state_dict(ckpt["model_state"])

    model.to(device)
    model.eval()

    meta = {
        "classes": classes,
        "device": device,
        "img_size": ckpt.get("img_size", 320),
        "arch": ckpt.get("arch", "convnext_tiny"),
        "run_name": ckpt.get("run_name", "cloud_model_best"),
        "ckpt_path": str(ckpt_path),
    }

    return model, meta
