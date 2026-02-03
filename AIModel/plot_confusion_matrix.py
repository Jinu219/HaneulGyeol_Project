import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
import csv

PROJECT_DIR = Path(__file__).resolve().parent
CSV_PATH = PROJECT_DIR / "outputs" / "confusion_matrix.csv"
OUT_PATH = PROJECT_DIR / "outputs" / "confusion_matrix.png"

with open(CSV_PATH, encoding="utf-8") as f:
    reader = csv.reader(f)
    rows = list(reader)

classes = rows[0][1:]
cm = np.array([list(map(int, r[1:])) for r in rows[1:]])

plt.figure(figsize=(10, 8))
plt.imshow(cm, cmap="Blues")
plt.colorbar()
plt.xticks(range(len(classes)), classes, rotation=45)
plt.yticks(range(len(classes)), classes)
plt.xlabel("Predicted")
plt.ylabel("True")
plt.title("Cloud Type Confusion Matrix")

for i in range(len(classes)):
    for j in range(len(classes)):
        plt.text(j, i, cm[i, j], ha="center", va="center", fontsize=8)

plt.tight_layout()
plt.savefig(OUT_PATH, dpi=200)
plt.show()

print(f"Saved confusion matrix -> {OUT_PATH}")
