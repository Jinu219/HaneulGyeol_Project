# 📌 하늘결 프로젝트 — Copilot 안내서

이 저장소는 크게 두 부분으로 구성되어 있습니다:

1. **`AIModel/`** – PyTorch 기반 분류기, 학습 스크립트, 데이터셋 분할, 그리고 FastAPI 추론 서버.
2. **`Web/haneul-gyeol/`** – Next.js 13(App Router) 프론트엔드로 구름 도감을 보여주고 Python API를 호출합니다.

이 문서는 아키텍처, 작업 흐름, 프로젝트 특유의 규칙을 빠르게 파악하기 위한 안내서입니다.

---

## 🧩 전체 아키텍처 개관

- **데이터**는 `AIModel/CCSN_v2` 아래에 있습니다. `split_dataset_ccsn.py`가 이미지를 무작위로 섞어서 `AIModel/splits/ccsn_split/{train,val,test}`로 복사합니다.
- **학습**: `python train.py`(빠른 CPU용) 또는 `python train_gpu.py`(GPU, `--img`, `--batch`, `--mixup` 등 옵션)로 실행합니다. 결과 모델과 로그는 `AIModel/outputs`에 저장됩니다.
- **모델 로딩**:
  - `model_loader_HF.py`는 Hugging‑Face 허브에서 체크포인트를 내려받고 `arch` 메타데이터에 따라 ResNet18 또는 ConvNeXt‑Tiny를 생성합니다. 환경변수 `HF_REPO_ID`, `HF_FILENAME` 등으로 구성됩니다.
  - `model_loader_LFS.py`는 개발할 때 로컬 파일시스템에서 간단히 모델을 읽어오는 버전입니다.
- **추론 헬퍼**: `predict_util.py`(데이터클래스 + 플래그)는 CLI `predict.py`에서 사용됩니다. FastAPI에서 참조되는 `predictor.py`에는 한글 이름/설명 매핑과 확신도 논리가 들어있습니다.
- **API**: `AIModel/api.py`는 FastAPI를 사용하며 `/health`와 `/predict` 엔드포인트를 제공합니다. 리액트 컴포넌트가 기대하는 응답 형식은 **`{success: bool, result?: {...}, error?: string}`** 입니다.
- **프론트엔드**:
  - Next.js 13(TypeScript) 코드는 `Web/haneul-gyeol/src`에 있습니다. 동적 경로 `app/atlas/[cloudId]`가 `cloudData.ts`의 내용을 렌더링합니다.
  - 정적 이미지는 `public/clouds/...`에서 서비스됩니다. `scripts/copy-cloud-images.js`는 Python 데이터셋에서 무작위로 이미지를 골라 복사하므로, `CCSN_v2`를 갱신한 후 반드시 실행하세요.
  - API URL은 `NEXT_PUBLIC_CLOUD_API_URL` 환경변수로 설정하며 개발 시 기본값은 `http://127.0.0.1:8000/predict` 입니다.
  - `AISection.tsx`, `MasonryGallery.tsx` 같은 컴포넌트는 `
## 🛠️ 개발 워크플로 & 명령어

1. **데이터셋 준비**
   ```bash
   cd AIModel
   python split_dataset_ccsn.py
   ```

2. **학습 실행**
   ```bash
   # CPU에서 빠르게 확인할 때
   python train.py

   # GPU로 본격 학습, 옵션 지정 가능
   python train_gpu.py --img 320 --batch 96 --epochs 20 --mixup 0.2 --aug light
   ```
   학습 결과 모델은 `AIModel/outputs/*.pt`에, 로그는 `train_log_*.csv`에 기록됩니다.

3. **로컬 추론**
   ```bash
   # CLI 사용
   python predict.py path/to/image.jpg path/to/checkpoint.pt

   # API 서버 시작 (uvicorn 필요)
   uvicorn api:app --host 0.0.0.0 --port 8000
   ```
   FastAPI 앱은 시작 시 모델 번들을 캐시하며, 로더가 로딩 메시지를 출력합니다.

4. **Hugging‑Face 업로드**
   - 자동화 스크립트 없음. 모델은 `HF_REPO_ID` 레포에 수동으로 올립니다. 체크포인트 딕셔너리에 `classes`, `arch`, `img_size` (선택적으로 `run_name`)을 포함해야 `model_loader_HF`가 제대로 읽습니다.

5. **웹 개발**
   ```bash
   cd Web/haneul-gyeol
   npm install       # 또는 yarn / pnpm / bun
   npm run dev       # http://localhost:3000 에 서버 실행
   ```
   - `AIModel/CCSN_v2`에 새 이미지를 추가한 후 `node scripts/copy-cloud-images.js`를 실행하고 개발 서버를 재시작해야 갤러리에서 보입니다.
   - 배포 시 API 엔드포인트를 바꾸려면 `NEXT_PUBLIC_CLOUD_API_URL`을 설정하세요.

6. **구름 항목 추가/수정**
   - `AIModel/cloud_classes.py`를 수정하세요 (학습 스크립트가 이 리스트를 사용합니다).
   - `cloudData.ts`에 소문자 키를 추가하고, `copy-cloud-images.js`의 `CLOUD_MAP`에 해당 폴더 이름을 매핑하세요.
   - `cloud-detail.css`의 클래스명이 `page.tsx`의 요소와 일치하는지 확인하세요. CSS 파일 주석에 각 셀렉터 용도가 설명되어 있습니다.

---

## 🔄 프로젝트 특유의 규칙과 패턴

- **이름 규칙**: 구름 코드는 두 글자(`Cu`, `Cb` 등)입니다. Python의 `CLOUD_INFO` 매핑과 프론트엔드 메타데이터에서 사용합니다. 웹 갤러리 스크립트는 `CLOUD_MAP` 하드코딩에 의존하므로 일관성을 유지해야 합니다.

- **메타데이터 객체**: `predictor.py`의 `predict_image`가 반환하는 API 결과 구조는 다음과 같습니다:
  ```ts
  interface ApiResult {
    predictions: {code,name_ko,confidence,description}[];
    confidence_level: "high"|"medium"|"low";
    confidence_text: string;
    tips: string[];          // level === "low"일 때만
    meta?: {img_size?: number; device?: string; arch?: string; run_name?: string;};
  }
  ```
  React 코드는 `top`과 `rest`로 분리하여 `<AISection />`에 렌더링합니다.

- **CSS 스타일**: 주석이 많은 평면 클래스명을 사용합니다. 스타일 파일은 해당 페이지/컴포넌트 옆에 둡니다. 대화 초반에 보여준 `cloud-detail.css`가 대표적인 사례입니다.

- **`use client`**: 상태(state)나 브라우저 API를 사용하는 컴포넌트는 최상단에 `"use client"`를 선언해야 합니다. 라우터 세그먼트 파일은 기본적으로 서버 컴포넌트입니다.

- **환경 변수**: Python 코드는 `os.getenv(...)`을 널리 사용합니다; `model_loader_HF.py`를 참고하세요. 프론트엔드는 `process.env.NEXT_PUBLIC_*`를 사용하며 `NEXT_PUBLIC_` 접두사가 필수입니다.

- **데이터 흐름**: 학습 스크립트는 `splits/ccsn_split`을 읽고, 모델 로더는 `(model, meta)`를 반환합니다. 메타 정보가 프론트엔드의 설명/확신도/메타 표시를 좌우하므로 형태를 깨뜨리지 않도록 합니다.

- **로깅**: 학습 스크립트는 고정된 헤더 형식의 CSV를 씁니다. 다른 유틸리티들도 `outputs/` 경로를 기대합니다.

---

## 🧯 자주 겪는 문제

- 데이터셋 이미지를 업데이트한 뒤 복사 스크립트를 재실행하지 않으면 갤러리에 404가 발생합니다.
- 구름 코드를 새로 추가하면 `CLOUD_CLASSES`, `cloudData.ts`, `CLOUD_MAP` 세 곳을 모두 수정해야 합니다. 하나라도 빼먹으면 AI 시스템이 에러를 냅니다.
- API를 수정할 때는 `success`/`error` 스키마를 유지하세요. 프론트엔드는 `data.error`를 읽어 오류를 처리합니다.
- `train_gpu.py`는 기본적으로 Windows에서 안전한 `num_workers=4`를 사용합니다. 값을 바꾸면 `persistent_workers` 설정도 조정해야 할 수 있습니다.
- HF 로더는 `module.`이나 `model.` 접두사를 자동 제거합니다. 비표준 체크포인트 형식을 저장하면 `load_checkpoint_to_model`을 업데이트해야 합니다.

---

위 내용 중 불명확하거나 빠진 항목이 있으면 말씀해 주세요.

응원합니다! 🚀
