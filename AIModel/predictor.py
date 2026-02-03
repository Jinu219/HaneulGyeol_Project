import torch
import torch.nn.functional as F
from torchvision import transforms

from model_loader import load_model

device = "cuda" if torch.cuda.is_available() else "cpu"

val_tf = transforms.Compose([
    transforms.Resize(368),
    transforms.CenterCrop(320),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485,0.456,0.406],
                         std=[0.229,0.224,0.225]),
])

def predict_image(model, img, topk=3):
    x = val_tf(img).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model(x)
        probs = F.softmax(logits, dim=1)[0]

    values, indices = probs.topk(topk)

    results = []
    for v, i in zip(values, indices):
        results.append({
            "label": model.classes[i] if hasattr(model, "classes") else int(i),
            "confidence": round(float(v), 3)
        })

    return results
