# api.py
import io
from typing import Any, Dict

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from model_loader_HF import get_model_bundle
from predict_utils import predict_image

app = FastAPI(title="HaneulGyeol Cloud Classifier API", version="1.0.0")

# Next.js 프론트 연결용 (필요에 맞게 origin 제한 가능)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 운영에서는 Next.js 도메인만 허용 추천
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 부팅 시 모델 미리 로드(첫 요청 지연 방지)
@app.on_event("startup")
def _startup_load_model():
    _ = get_model_bundle()


@app.get("/health")
def health() -> Dict[str, Any]:
    b = get_model_bundle()
    return {
        "status": "ok",
        "device": b.device,
        "num_classes": len(b.class_names),
        "classes": b.class_names,
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> Dict[str, Any]:
    b = get_model_bundle()

    data = await file.read()
    image = Image.open(io.BytesIO(data))

    result = predict_image(
        model=b.model,
        device=b.device,
        class_names=b.class_names,
        image=image,
        topk=3,
        # 필요하면 여기 threshold 조정 가능
        low_conf_threshold=0.45,
        mix_gap_threshold=0.10,
        entropy_threshold=2.0,
    )

    # dataclass를 dict로 변환
    return {
        "filename": file.filename,
        "top1": {"label": result.top1.label, "prob": result.top1.prob},
        "top3": [{"label": p.label, "prob": p.prob} for p in result.top3],
        "flags": result.flags,
        "notes": [
            "possible_mixed_cloud=True면 혼합운/경계 케이스일 수 있습니다.",
            "low_confidence=True면 결과를 참고용으로만 사용하세요.",
        ],
    }
