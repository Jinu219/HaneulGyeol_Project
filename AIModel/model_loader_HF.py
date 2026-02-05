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
    
HF_REPO_ID   = os.getenv("HF_REPO_ID", "Jinu219/HaneulGyeol")

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



def load_checkpoint_to_model(
    model: torch.nn.Module,
    ckpt_path: str
) -> tuple[torch.nn.Module, dict]:
    """
    다양한 저장 형식의 checkpoint를 안전하게 로드한다.

    지원 형태:
    1) ckpt["model_state"]        (너 케이스, 가장 중요)
    2) ckpt["state_dict"]
    3) ckpt["model_state_dict"]
    4) ckpt 자체가 state_dict
    + prefix: module. / model. 자동 제거
    """

    ckpt = torch.load(ckpt_path, map_location="cpu")

    meta: dict = {}
    state: dict | None = None

    # --------------------------------------------------
    # 1) state_dict 추출
    # --------------------------------------------------
    if isinstance(ckpt, dict):
        if "model_state" in ckpt:
            # ✅ 너가 저장한 형식
            state = ckpt["model_state"]
            meta = {k: v for k, v in ckpt.items() if k != "model_state"}

        elif "state_dict" in ckpt:
            state = ckpt["state_dict"]
            meta = {k: v for k, v in ckpt.items() if k != "state_dict"}

        elif "model_state_dict" in ckpt:
            state = ckpt["model_state_dict"]
            meta = {k: v for k, v in ckpt.items() if k != "model_state_dict"}

        else:
            # dict 자체가 state_dict인 경우
            state = ckpt
            meta = {}
    else:
        # tensor / OrderedDict 그대로 저장된 경우
        state = ckpt
        meta = {}

    if not isinstance(state, dict):
        raise RuntimeError("Checkpoint does not contain a valid state_dict.")

    # --------------------------------------------------
    # 2) prefix 정리
    # --------------------------------------------------
    # DataParallel: module.*
    if any(k.startswith("module.") for k in state.keys()):
        state = {k.replace("module.", "", 1): v for k, v in state.items()}

    # Trainer wrapper: model.*
    if any(k.startswith("model.") for k in state.keys()):
        state = {k.replace("model.", "", 1): v for k, v in state.items()}

    # --------------------------------------------------
    # 3) state_dict 로드
    # --------------------------------------------------
    model.load_state_dict(state, strict=True)

    return model, meta





def download_model_from_hf() -> str:
    """
    Hugging Face Hub에서 모델 파일을 다운로드하고 로컬 경로 반환.
    """
    repo_id = os.getenv("HF_REPO_ID", "Jinu219/HaneulGyeol")

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


# model_loader_HF.py (일부)

_bundle = None



def get_model_bundle() -> ModelBundle:
    """
    싱글톤처럼 한 번만 로드해서 재사용.

    """
    global _bundle
    if _bundle is not None:
        return _bundle

    from cloud_classes import CLOUD_CLASSES
    import os
    import torch

    # --------------------------------------------------
    # 1) 디바이스 결정
    # --------------------------------------------------
    device = "cuda" if torch.cuda.is_available() else "cpu"

    # --------------------------------------------------
    # 2) HF에서 ckpt 다운로드
    # --------------------------------------------------
    ckpt_path = download_model_from_hf()

    # --------------------------------------------------
    # 3) ckpt 로드 (메타 먼저 확인)
    # --------------------------------------------------
    ckpt = torch.load(ckpt_path, map_location="cpu")

    # 기본값 (fallback)
    class_names = CLOUD_CLASSES[:]
    arch = "resnet18"

    if isinstance(ckpt, dict):
        # ✅ 저장된 클래스 순서 사용 (가장 중요)
        if "classes" in ckpt and isinstance(ckpt["classes"], (list, tuple)):
            class_names = list(ckpt["classes"])

        # ✅ 저장된 모델 구조 확인
        if "arch" in ckpt and isinstance(ckpt["arch"], str):
            arch = ckpt["arch"].lower()

    num_classes = len(class_names)

    # --------------------------------------------------
    # 4) 모델 생성 (arch 자동 분기)
    # --------------------------------------------------
    if arch in ["resnet18", "resnet-18"]:
        model = build_resnet18(num_classes=num_classes)
    elif arch in ["convnext_tiny", "convnext-tiny", "convnexttiny"]:
        model = build_convnext_tiny(num_classes=num_classes)
    else:
        raise RuntimeError(f"Unsupported architecture in checkpoint: {arch}")


    # --------------------------------------------------
    # 5) state_dict 로드 (model_state)
    # --------------------------------------------------
    model, meta = load_checkpoint_to_model(model, ckpt_path)

    # --------------------------------------------------
    # 6) 디바이스 이동 및 eval
    # --------------------------------------------------
    model.to(device)
    model.eval()

    # --------------------------------------------------
    # 7) 번들로 묶기
    # --------------------------------------------------
    _bundle = ModelBundle(
        model=model,
        device=device,
        class_names=class_names,
    )

    # --------------------------------------------------
    # 8) 로그 (선택)
    # --------------------------------------------------
    print(
        f"[HaneulGyeol] Model loaded | "
        f"arch={arch}, "
        f"num_classes={num_classes}, "
        f"device={device}"
    )

    return _bundle

from torchvision import models
import torch.nn as nn

def build_convnext_tiny(num_classes: int) -> torch.nn.Module:
    """
    ConvNeXt-Tiny backbone. classifier 마지막 Linear를 num_classes로 교체.
    torchvision 버전에 따라 weights enum이 다를 수 있으므로 weights=None 사용.
    """
    model = models.convnext_tiny(weights=None)

    # torchvision convnext는 classifier가 Sequential로 되어있고 마지막이 Linear인 경우가 많음
    if isinstance(model.classifier, nn.Sequential):
        # 마지막 Linear 찾아 교체
        # 보통: [LayerNorm2d/Flatten/Linear] 형태라 마지막 인덱스가 Linear
        last_idx = None
        for i in range(len(model.classifier) - 1, -1, -1):
            if isinstance(model.classifier[i], nn.Linear):
                last_idx = i
                in_features = model.classifier[i].in_features
                break
        if last_idx is None:
            raise RuntimeError("Could not find Linear layer in ConvNeXt classifier.")
        model.classifier[last_idx] = nn.Linear(in_features, num_classes)
    else:
        raise RuntimeError("Unexpected ConvNeXt classifier type.")

    return model
