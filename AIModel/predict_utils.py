# predict_utils.py
from dataclasses import asdict, dataclass
from typing import List, Tuple, Dict, Any

import numpy as np
import torch
from PIL import Image
from torchvision import transforms


@dataclass
class Prediction:
    label: str
    prob: float


@dataclass
class PredictResponse:
    top1: Prediction
    top3: List[Prediction]
    flags: Dict[str, Any]


def build_infer_transform() -> transforms.Compose:
    """
    학습 시 사용한 mean/std가 따로 있으면 그걸로 맞추는 게 제일 좋음.
    일반적으로 ImageNet pretrained 기준이면 아래가 표준.
    """
    return transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ])


@torch.inference_mode()
def predict_image(
    model: torch.nn.Module,
    device: str,
    class_names: List[str],
    image: Image.Image,
    topk: int = 3,
    low_conf_threshold: float = 0.45,
    mix_gap_threshold: float = 0.10,
    entropy_threshold: float = 2.0,
) -> PredictResponse:
    """
    - top1/top3 반환
    - 불확실/혼합 가능성 플래그 제공
    """
    if image.mode != "RGB":
        image = image.convert("RGB")

    tfm = build_infer_transform()
    x = tfm(image).unsqueeze(0).to(device)

    logits = model(x)
    probs = torch.softmax(logits, dim=1)[0]  # (C,)

    # TopK
    k = min(topk, probs.numel())
    top_probs, top_idx = torch.topk(probs, k=k, dim=0)

    top_list = []
    for p, idx in zip(top_probs.tolist(), top_idx.tolist()):
        top_list.append(Prediction(label=class_names[idx], prob=float(p)))

    top1 = top_list[0]
    top2 = top_list[1] if len(top_list) > 1 else None

    # flags
    # 엔트로피: 분포가 퍼져있을수록 큼 (불확실)
    p_np = probs.detach().cpu().numpy().astype(np.float64)
    entropy = float(-np.sum(p_np * np.log(p_np + 1e-12)))

    is_low_conf = top1.prob < low_conf_threshold
    is_mixed = (top2 is not None) and ((top1.prob - top2.prob) < mix_gap_threshold)
    is_high_entropy = entropy > entropy_threshold

    flags = {
        "low_confidence": is_low_conf,
        "possible_mixed_cloud": is_mixed,
        "high_entropy": is_high_entropy,
        "entropy": entropy,
        "thresholds": {
            "low_conf_threshold": low_conf_threshold,
            "mix_gap_threshold": mix_gap_threshold,
            "entropy_threshold": entropy_threshold,
        }
    }

    return PredictResponse(
        top1=top1,
        top3=top_list,
        flags=flags,
    )
