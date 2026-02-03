# AIModel/api.py
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from PIL import Image
import io

from model_loader import load_model
from predictor import predict_image

app = FastAPI(title="HaneulGyeol Cloud Classifier")

model, meta = load_model()

@app.get("/")
def root():
    return {"message": "HaneulGyeol Cloud API is running"}

@app.get("/health")
def health():
    return {
        "status": "ok",
        "device": meta["device"],
        "arch": meta.get("arch"),
        "run_name": meta.get("run_name"),
        "img_size": meta.get("img_size"),
        "ckpt_path": meta.get("ckpt_path"),
        "num_classes": len(meta["classes"]),
        "classes": meta["classes"],
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        result = predict_image(model, meta, img, topk=3)
        return JSONResponse(content={"success": True, "result": result})

    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})
