import random
import shutil
from pathlib import Path

ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

PROJECT_DIR = Path(__file__).resolve().parent  # ...\HaneulGyeol_Project\AIModel
SRC = PROJECT_DIR / "CCSN_v2"
DST = PROJECT_DIR / "splits" / "ccsn_split"

TRAIN = 0.8
VAL = 0.1
SEED = 42

def is_image(p: Path):
    return p.is_file() and p.suffix.lower() in ALLOWED_EXT

def ensure(p: Path):
    p.mkdir(parents=True, exist_ok=True)

def copy_all(files, outdir):
    ensure(outdir)
    for f in files:
        shutil.copy2(f, outdir / f.name)

def main():
    random.seed(SEED)

    # 기존 split 폴더 삭제 후 새로 생성
    if DST.exists():
        shutil.rmtree(DST)
    ensure(DST)

    class_dirs = [d for d in sorted(SRC.iterdir()) if d.is_dir()]
    if not class_dirs:
        raise RuntimeError("SRC 아래에 클래스 폴더가 없습니다. 경로를 확인하세요.")

    print("=== Split Summary ===")
    for cdir in class_dirs:
        files = [p for p in sorted(cdir.iterdir()) if is_image(p)]
        random.shuffle(files)

        n = len(files)
        n_train = int(n * TRAIN)
        n_val = int(n * VAL)

        tr = files[:n_train]
        va = files[n_train:n_train+n_val]
        te = files[n_train+n_val:]

        copy_all(tr, DST / "train" / cdir.name)
        copy_all(va, DST / "val" / cdir.name)
        copy_all(te, DST / "test" / cdir.name)

        print(f"{cdir.name:>3} | total {n:4d} | train {len(tr):4d} | val {len(va):4d} | test {len(te):4d}")

    print(f"\n✅ saved split to: {DST}")

if __name__ == "__main__":
    main()
