# model_loader.py
import os
from dataclasses import dataclass
from typing import Optional, Tuple

import torch
from huggingface_hub import hf_hub_download
from torchvision import models

from cloud_classes import CLOUD_CLASSES


@dataclass
class ModelBundle:
    model: torch.nn.Module
    device: str
    class_names: list
    
HF_REPO_ID   = os.getenv("HF_REPO_ID", "Jinu219/HanuelGyeol")
HF_FILENAME  = os.getenv("HF_FILENAME", "cloud_model_best.pt")
HF_REVISION  = os.getenv("HF_REVISION")  # 선택: "main" 또는 커밋 해시/태그
HF_CACHE_DIR = os.getenv("HF_CACHE_DIR", "./hf_cache")  # 컨테이너 로컬 캐시

def load_model(model_ctor, device: str):
    # 1) Hub에서 모델 파일 다운로드(캐시됨) → 로컬 경로 획득
    model_path = hf_hub_download(
        repo_id=HF_REPO_ID,
        filename=HF_FILENAME,
        revision=HF_REVISION,
        cache_dir=HF_CACHE_DIR,
    )

    # 2) 로드
    model = model_ctor()
    ckpt = torch.load(model_path, map_location="cpu")
    state = ckpt.get("state_dict", ckpt) if isinstance(ckpt, dict) else ckpt
    model.load_state_dict(state, strict=True)

    model.to(device).eval()
    return model

def build_resnet18(num_classes: int) -> torch.nn.Module:
    """
    ResNet18 backbone. 최종 FC만 num_classes로 교체.
    (학습 때 ResNet18 fine-tuning 했다는 전제)
    """
    model = models.resnet18(weights=None)  # 가중치는 ckpt로 로드하므로 None
    model.fc = torch.nn.Linear(model.fc.in_features, num_classes)
    return model


def get_device() -> str:
    return "cuda" if torch.cuda.is_available() else "cpu"


def load_checkpoint_to_model(model: torch.nn.Module, ckpt_path: str) -> torch.nn.Module:
    ckpt = torch.load(ckpt_path, map_location="cpu")

    # 저장 형태가 다양해서 안전하게 처리:
    # 1) {"state_dict": ...}
    # 2) {"model_state_dict": ...}
    # 3) 그냥 state_dict 자체
    if isinstance(ckpt, dict):
        if "state_dict" in ckpt:
            state = ckpt["state_dict"]
        elif "model_state_dict" in ckpt:
            state = ckpt["model_state_dict"]
        else:
            # 혹시 dict 자체가 state_dict일 수도
            # (key가 weight 이름들로 구성된 경우)
            state = ckpt
    else:
        state = ckpt

    # DataParallel로 저장된 경우 "module." prefix 제거
    if any(k.startswith("module.") for k in state.keys()):
        state = {k.replace("module.", "", 1): v for k, v in state.items()}

    model.load_state_dict(state, strict=True)
    return model


def download_model_from_hf() -> str:
    """
    Hugging Face Hub에서 모델 파일을 다운로드하고 로컬 경로 반환.
    """
    repo_id = os.getenv("HF_REPO_ID")
    if not repo_id:
        raise RuntimeError("HF_REPO_ID environment variable is required.")

    filename = os.getenv("HF_FILENAME", "cloud_model_best.pt")
    revision = os.getenv("HF_REVISION")  # optional: main / commit hash / tag
    cache_dir = os.getenv("HF_CACHE_DIR", "./hf_cache")

    local_path = hf_hub_download(
        repo_id=repo_id,
        filename=filename,
        revision=revision,
        cache_dir=cache_dir,
    )
    return local_path


_bundle: Optional[ModelBundle] = None


def get_model_bundle() -> ModelBundle:
    """
    싱글톤처럼 한 번만 로드해서 재사용.
    """
    global _bundle
    if _bundle is not None:
        return _bundle

    num_classes = int(os.getenv("NUM_CLASSES", str(len(CLOUD_CLASSES))))
    class_names = CLOUD_CLASSES[:]

    device = get_device()

    ckpt_path = download_model_from_hf()
    model = build_resnet18(num_classes=num_classes)
    model = load_checkpoint_to_model(model, ckpt_path)

    model.to(device)
    model.eval()

    _bundle = ModelBundle(model=model, device=device, class_names=class_names)
    return _bundle

