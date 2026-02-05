# api.py (HF Space / Docker에서 사용할 버전)
import io
from typing import Any, Dict

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image

from model_loader_HF import get_model_bundle
from predictor import predict_image  # ✅ predictor 방식 사용

app = FastAPI(title="HaneulGyeol Cloud Classifier API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # 운영시 Next 도메인만 허용해도 됨
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def infer_arch(model) -> str:
    # 완벽하진 않지만 메타 표시용으로 충분
    if hasattr(model, "fc"):
        return "resnet18"
    name = model.__class__.__name__.lower()
    if "convnext" in name or hasattr(model, "classifier"):
        return "convnext_tiny"
    return "unknown"

@app.on_event("startup")
def _startup_load_model():
    _ = get_model_bundle()

@app.get("/")
def root() -> Dict[str, Any]:
    # HF가 / 를 자주 찍어봄(로그에 뜨는 GET /)
    return {"ok": True, "service": "HaneulGyeol API", "endpoints": ["/health", "/predict"]}

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
async def predict(file: UploadFile = File(...)):
    try:
        b = get_model_bundle()

        data = await file.read()
        img = Image.open(io.BytesIO(data)).convert("RGB")

        # ✅ predictor가 요구하는 meta 구성
        meta = {
            "device": b.device,
            "classes": b.class_names,
            "img_size": 320,              # 학습 기준 사이즈로(필요하면 env로 뺄 수 있음)
            "arch": infer_arch(b.model),
            "run_name": "hf-space",
        }

        result = predict_image(
            model=b.model,
            meta=meta,
            img=img,
            topk=3,
        )

        # ✅ AISection이 기대하는 응답 구조
        return {"success": True, "result": result}

    except Exception as e:
        # ✅ AISection이 기대하는 error 구조
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)},
        )
