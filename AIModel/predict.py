import sys
from pathlib import Path
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image

CLOUD_DESC = {
    "Ac": "고적운: 중층에 나타나는 작은 구름 덩어리들이 물결처럼 배열된 구름",
    "As": "고층운: 하늘을 넓게 덮는 회색 또는 푸른빛의 얇은 층구름",
    "Cb": "적란운: 강한 상승기류로 형성되며 소나기·뇌우를 동반하는 구름",
    "Cc": "권적운: 매우 높은 고도에서 생기는 작은 비늘 모양의 구름",
    "Ci": "권운: 깃털처럼 가늘고 흰 실 모양의 상층 구름",
    "Cs": "권층운: 태양·달 주위에 헤일로를 만드는 얇은 막 형태의 구름",
    "Ct": "비행운: 항공기 배기가스에 의해 형성된 인공 구름",
    "Cu": "적운: 날씨가 좋을 때 흔히 보이는 뭉게구름",
    "Ns": "난층운: 장시간 지속되는 비나 눈을 내리게 하는 두꺼운 층구름",
    "Sc": "층적운: 낮은 고도에서 넓게 퍼진 덩어리형 구름",
    "St": "층운: 안개처럼 하늘을 덮는 매우 낮은 구름",
}

PROJECT_DIR = Path(__file__).resolve().parent
DEFAULT_MODEL = PROJECT_DIR / "outputs" / "cloud_model_fast.pt"  # fallback

device = "cuda" if torch.cuda.is_available() else "cpu"


def build_model(arch: str, num_classes: int):
    arch = (arch or "").lower()
    if arch == "convnext_tiny":
        m = models.convnext_tiny(weights=None)
        m.classifier[2] = nn.Linear(m.classifier[2].in_features, num_classes)
        return m
    # fallback: resnet18
    m = models.resnet18(weights=None)
    m.fc = nn.Linear(m.fc.in_features, num_classes)
    return m


def load_checkpoint(model_path: Path):
    ckpt = torch.load(model_path, map_location=device)

    # fast model format
    if "model" in ckpt and "classes" in ckpt:
        classes = ckpt["classes"]
        arch = "resnet18"
        img_size = 192
        model = build_model(arch, len(classes))
        model.load_state_dict(ckpt["model"])
        return model, classes, img_size, arch

    # gpu model format
    classes = ckpt["classes"]
    img_size = int(ckpt.get("img_size", 224))
    arch = ckpt.get("arch", "convnext_tiny")
    model = build_model(arch, len(classes))
    model.load_state_dict(ckpt["model_state"])
    return model, classes, img_size, arch


def make_tf(img_size: int):
    return transforms.Compose([
        transforms.Resize(int(img_size * 1.15)),
        transforms.CenterCrop(img_size),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]),
    ])


def predict_image(model, classes, tf, img_path: Path, topk=3):
    img = Image.open(img_path).convert("RGB")
    x = tf(img).unsqueeze(0).to(device)

    model.eval()
    with torch.no_grad():
        logits = model(x)
        probs = torch.softmax(logits, dim=1)[0]
    values, indices = probs.topk(topk)

    results = []
    for v, i in zip(values, indices):
        label = classes[int(i)]
        results.append((label, float(v)))
    return results


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python predict.py <image_path> [model_path(optional)]")
        sys.exit(1)

    img_path = Path(sys.argv[1])
    model_path = Path(sys.argv[2]) if len(sys.argv) >= 3 else DEFAULT_MODEL

    model, classes, img_size, arch = load_checkpoint(model_path)
    model.to(device)
    tf = make_tf(img_size)

    results = predict_image(model, classes, tf, img_path, topk=3)

    print(f"\n🌥️ Model: {arch} | img_size={img_size} | device={device}")
    print("🌥️ 구름 분류 결과 (Top-3):\n")
    for rank, (label, prob) in enumerate(results, 1):
        desc = CLOUD_DESC.get(label, "설명 없음")
        print(f"{rank}. {label} ({prob*100:.1f}%)")
        print(f"   → {desc}\n")
