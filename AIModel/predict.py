# predict.py
import sys
from pathlib import Path
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image

# -----------------------
# 운형 설명 사전
# -----------------------
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
    "St": "층운: 안개처럼 하늘을 덮는 매우 낮은 구름"
}

# -----------------------
# 설정
# -----------------------
PROJECT_DIR = Path(__file__).resolve().parent
MODEL_PATH = PROJECT_DIR / "outputs" / "cloud_model_fast.pt"
IMG_SIZE = 192

device = "cuda" if torch.cuda.is_available() else "cpu"

# -----------------------
# Transform
# -----------------------
tf = transforms.Compose([
    transforms.Resize(224),
    transforms.CenterCrop(IMG_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

# -----------------------
# Load model
# -----------------------
ckpt = torch.load(MODEL_PATH, map_location=device)
classes = ckpt["classes"]

model = models.resnet18(weights=None)
model.fc = nn.Linear(model.fc.in_features, len(classes))
model.load_state_dict(ckpt["model"])
model.to(device)
model.eval()

# -----------------------
# Predict
# -----------------------
def predict_image(img_path: Path, topk=3):
    img = Image.open(img_path).convert("RGB")
    x = tf(img).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model(x)
        probs = torch.softmax(logits, dim=1)[0]

    values, indices = probs.topk(topk)
    results = []

    for v, i in zip(values, indices):
        label = classes[i]
        results.append((label, float(v)))

    return results

# -----------------------
# Main
# -----------------------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python predict.py <image_path>")
        sys.exit(1)

    img_path = Path(sys.argv[1])
    results = predict_image(img_path, topk=3)

    print("\n🌥️ 구름 분류 결과 (Top-3):\n")
    for rank, (label, prob) in enumerate(results, 1):
        desc = CLOUD_DESC.get(label, "설명 없음")
        print(f"{rank}. {label} ({prob*100:.1f}%)")
        print(f"   → {desc}\n")
