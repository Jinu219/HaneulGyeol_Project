from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from PIL import Image
import io
import torch
import torch.nn.functional as F

from predictor import load_model, predict_image

app = FastAPI(title="HaneulGyeol Cloud Classifier")

# 서버 시작 시 모델 1번만 로드
model, meta = load_model()
classes = meta["classes"]

@app.get("/")
def root():
    return {"message": "HaneulGyeol Cloud API is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        results = predict_image(model, img, topk=3)

        return JSONResponse(content={
            "success": True,
            "predictions": results
        })

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )
