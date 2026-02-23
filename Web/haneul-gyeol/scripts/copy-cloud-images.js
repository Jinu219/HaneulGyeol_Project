/**
 * copy-cloud-images.js
 *
 * 실제 폴더 구조:
 *   HaneulGyeol_Project/
 *   ├── AIModel/CCSN_v2/{Ac,As,Cb,Cc,Ci,Cs,...}/
 *   └── Web/hanuel-gyeol/          ← Next.js 루트
 *       └── public/clouds/         ← 여기로 복사
 *
 * 실행 위치: Web/hanuel-gyeol/ 에서
 *   node scripts/copy-cloud-images.js
 */

const fs   = require("fs");
const path = require("path");

// ── 경로 설정 ──────────────────────────────────────────────────
// __dirname = Web/hanuel-gyeol/scripts/
// CCSN_v2   = ../../../AIModel/CCSN_v2  (HaneulGyeol_Project 기준)
const CCSN_ROOT   = path.resolve(__dirname, "..", "..", "..", "AIModel", "CCSN_v2");
const PUBLIC_ROOT = path.resolve(__dirname, "..", "public", "clouds");
const MAX_IMAGES  = 30;
const IMG_EXTS    = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const CLOUD_MAP = {
  Ac: "ac",
  As: "as",
  Cb: "cb",
  Cc: "cc",
  Ci: "ci",
  Cs: "cs",
  // 사진 생기면 추가:
  Cu: "cu", 
  Ns: "ns", 
  St: "st", 
  Sc: "sc",
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isImg(f) { return IMG_EXTS.has(path.extname(f).toLowerCase()); }
function mkdir(p) { fs.mkdirSync(p, { recursive: true }); }

function makeSubDirs(cloudId) {
  for (const sub of ["species", "varieties", "supplementary"]) {
    mkdir(path.join(PUBLIC_ROOT, cloudId, sub));
  }
}

console.log("🌤️  하늘결 이미지 복사 시작\n");
console.log("CCSN_v2 경로:", CCSN_ROOT);
console.log("public 경로 :", PUBLIC_ROOT, "\n");

if (!fs.existsSync(CCSN_ROOT)) {
  console.error("❌  CCSN_v2 폴더를 찾을 수 없습니다:", CCSN_ROOT);
  console.error("   scripts/ 폴더가 Web/hanuel-gyeol/scripts/ 에 있는지 확인하세요.");
  process.exit(1);
}

for (const [ccsn, id] of Object.entries(CLOUD_MAP)) {
  const src  = path.join(CCSN_ROOT, ccsn);
  const dest = path.join(PUBLIC_ROOT, id, "gallery");

  if (!fs.existsSync(src)) { console.warn(`⚠️  없음: ${src}`); continue; }

  mkdir(dest);
  makeSubDirs(id);

  const all    = fs.readdirSync(src).filter(isImg);
  const chosen = shuffle(all).slice(0, MAX_IMAGES);
  let copied   = 0;

  chosen.forEach((file, i) => {
    const ext  = path.extname(file);
    const name = String(i + 1).padStart(2, "0") + ext;
    try {
      fs.copyFileSync(path.join(src, file), path.join(dest, name));
      copied++;
    } catch (e) { console.error("  복사 실패:", file, e.message); }
  });

  console.log(`✅  ${ccsn} → public/clouds/${id}/gallery/  (${all.length}장 중 ${copied}장)`);
}

console.log("\n🎉  완료! npm run dev 재시작 후 확인하세요.");
