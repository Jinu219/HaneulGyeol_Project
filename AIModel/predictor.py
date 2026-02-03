# AIModel/predictor.py
from PIL import Image
import torch
import torch.nn.functional as F
from torchvision import transforms

# ✅ 운형 코드 -> 한글명/설명 (너 취향대로 길게 늘려도 됨)
CLOUD_INFO = {
    "Cu": {"ko": "적운", "desc": "하층의 뭉게뭉게한 구름. 맑은 날 낮에 발달하기 쉽다."},
    "Cb": {"ko": "적란운", "desc": "강한 상승기류로 수직 발달. 소나기·뇌우·번개를 동반할 수 있다."},
    "Sc": {"ko": "층적운", "desc": "하층의 덩어리 구름이 넓게 퍼진 형태. 구름 사이로 하늘이 조각조각 보이기도 한다."},
    "St": {"ko": "층운", "desc": "낮게 깔리는 안개 같은 층 구름. 흐리고 균일한 회색 하늘 느낌."},
    "As": {"ko": "고층운", "desc": "중층의 넓은 막 형태. 해가 물비늘처럼 흐릿하게 비칠 수 있다."},
    "Ac": {"ko": "고적운", "desc": "중층의 작은 덩어리들이 무리 지어 배열. 물결·비늘처럼 보이기도 한다."},
    "Cs": {"ko": "권층운", "desc": "상층의 얇은 베일 같은 구름. 해/달 무리(halo)가 나타날 수 있다."},
    "Ci": {"ko": "권운", "desc": "상층의 실처럼 가늘고 섬유질. 맑은 하늘에 흩어져 보인다."},
    "Cc": {"ko": "권적운", "desc": "상층의 매우 작은 알갱이(비늘) 무늬. ‘비늘하늘’처럼 보일 수 있다."},
    "Ns": {"ko": "난층운", "desc": "비를 오래 내리는 두꺼운 층 구름. 하늘이 어둡고 균일하다."},
    "Ct": {"ko": "권운계(데이터셋 Ct)", "desc": "CCSN 라벨 체계의 Ct 클래스(상층 계열). 데이터셋 정의에 따른 범주."},
}

# ✅ 확신도 메시지 규칙
def confidence_level(p1: float, p2: float) -> str:
    if p1 >= 0.60 and (p1 - p2) >= 0.15:
        return "high"
    if p1 >= 0.45 and (p1 - p2) >= 0.08:
        return "medium"
    return "low"

def confidence_text(level: str) -> str:
    return {
        "high": "확신 높음",
        "medium": "확신 보통(비슷한 후보가 있음)",
        "low": "확신 낮음(혼합운/조건 영향 가능)",
    }[level]

# ✅ 확신 낮을 때 촬영 팁
TIPS = [
    "하늘 비율을 크게(건물/지평선 최소화) 촬영해 주세요.",
    "역광(태양 정면)보다는 태양이 옆/뒤에 오도록 촬영해 주세요.",
    "확대(줌)보다 하늘 전체 패턴이 보이게 찍는 게 좋아요.",
    "구름이 여러 층으로 섞여 있으면 혼합운으로 예측이 흔들릴 수 있어요.",
]

def build_transform(img_size: int):
    return transforms.Compose([
        transforms.Resize(int(img_size * 1.15)),
        transforms.CenterCrop(img_size),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]),
    ])

def predict_image(model, meta, img: Image.Image, topk: int = 3):
    device = meta["device"]
    img_size = int(meta.get("img_size", 320))

    tf = build_transform(img_size)
    x = tf(img).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model(x)
        probs = F.softmax(logits, dim=1)[0]

    values, indices = probs.topk(topk)

    preds = []
    for v, i in zip(values.tolist(), indices.tolist()):
        code = meta["classes"][i]  # "Cu", "Ac", ...
        info = CLOUD_INFO.get(code, {"ko": code, "desc": "설명 준비 중"})
        preds.append({
            "code": code,
            "name_ko": info["ko"],
            "confidence": round(float(v), 4),
            "description": info["desc"],
        })

    p1 = preds[0]["confidence"]
    p2 = preds[1]["confidence"] if len(preds) > 1 else 0.0
    level = confidence_level(p1, p2)

    return {
        "predictions": preds,
        "confidence_level": level,      # high / medium / low
        "confidence_text": confidence_text(level),
        "tips": TIPS if level == "low" else [],
        "meta": {
            "img_size": img_size,
            "device": meta.get("device"),
            "arch": meta.get("arch", "unknown"),
            "run_name": meta.get("run_name", "unknown"),
        }
    }
