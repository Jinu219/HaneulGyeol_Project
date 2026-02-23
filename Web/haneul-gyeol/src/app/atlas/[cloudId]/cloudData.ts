// src/app/atlas/[cloudId]/cloudData.ts
//
// WMO 국제구름사전 기준 — 부경대학교 환경대기과학전공 번역 자료 반영
//
// 이미지 경로 규칙:
//   갤러리:  /clouds/{id}/gallery/01.jpg ...
//   종:      /clouds/{id}/species/{en}/01.jpg ...
//   변종:    /clouds/{id}/varieties/{en}/01.jpg ...
//   부속:    /clouds/{id}/supplementary/{en}/01.jpg ...

export type CloudGalleryItem = {
  src: string;
  alt: string;
  credit?: string;
};

export type CloudDetailItem = {
  name_ko: string;   // 한글 번역명
  name_en: string;   // 라틴어 원어명
  code: string;      // 약어
  description: string;
  formation: string;
  images: CloudGalleryItem[];
};

export type CloudDetail = {
  symbol: string;
  name_ko: string;
  name_en: string;
  level: "high" | "mid" | "low";
  level_ko: string;
  composition: string;
  image: string;
  imageCredit?: string;
  images: CloudGalleryItem[];
  definition: string;
  formation: string;
  species: CloudDetailItem[];
  varieties: CloudDetailItem[];
  supplementary: CloudDetailItem[];
  physical: string;
  observation: string;
};

// ─── 헬퍼 ────────────────────────────────────────────────────────
function gallery(id: string, n: number, credit = ""): CloudGalleryItem[] {
  return Array.from({ length: n }, (_, i) => ({
    src: `/clouds/${id}/gallery/${String(i + 1).padStart(2, "0")}.jpg`,
    alt: `${id.toUpperCase()} 사진 ${i + 1}`,
    credit,
  }));
}

function sub(
  id: string,
  type: "species" | "varieties" | "supplementary",
  nameEn: string,
  n: number
): CloudGalleryItem[] {
  return Array.from({ length: n }, (_, i) => ({
    src: `/clouds/${id}/${type}/${nameEn}/${String(i + 1).padStart(2, "0")}.jpg`,
    alt: `${nameEn} 사진 ${i + 1}`,
  }));
}

// 빈 아이템 생성 단축함수
const item = (
  name_ko: string,
  name_en: string,
  code: string,
  id: string,
  type: "species" | "varieties" | "supplementary"
): CloudDetailItem => ({
  name_ko,
  name_en,
  code,
  description: "",
  formation: "",
  images: sub(id, type, name_en, 0),
});

// ─────────────────────────────────────────────────────────────────

export const cloudDetailData: Record<string, CloudDetail> = {

  // ══════════════════════════════════════════════════════
  // 상층운 (High Clouds, 5–13 km)
  // ══════════════════════════════════════════════════════

  ci: {
    symbol: "Ci",
    name_ko: "권운",
    name_en: "Cirrus",
    level: "high",
    level_ko: "상층운",
    composition: "얼음 결정",
    image: "/clouds/ci/gallery/01.jpg",
    imageCredit: "CCSN Dataset",
    images: gallery("ci", 30, "CCSN Dataset"),
    definition: "",
    formation: "",
    // ── 종 (5개) ──
    species: [
      item("명주실구름", "fibratus",   "fib", "ci", "species"),
      item("갈퀴구름",   "uncinus",    "unc", "ci", "species"),
      item("농밀구름",   "spissatus",  "spi", "ci", "species"),
      item("탑상구름",   "castellanus","cas", "ci", "species"),
      item("포기구름",   "floccus",    "flo", "ci", "species"),
    ],
    // ── 변종 (4개) ──
    varieties: [
      item("얽힌구름", "intortus",    "in", "ci", "varieties"),
      item("방사구름", "radiatus",    "ra", "ci", "varieties"),
      item("늑골구름", "vertebratus", "ve", "ci", "varieties"),
      item("이중구름", "duplicatus",  "du", "ci", "varieties"),
    ],
    // ── 부속구름 및 부가적 특성 (2개) ──
    supplementary: [
      item("유방구름", "mamma",   "mam", "ci", "supplementary"),
      item("파도구름", "fluctus", "flu", "ci", "supplementary"),
    ],
    physical: "",
    observation: "",
  },

  cc: {
    symbol: "Cc",
    name_ko: "권적운",
    name_en: "Cirrocumulus",
    level: "high",
    level_ko: "상층운",
    composition: "얼음 결정 + 과냉각수",
    image: "/clouds/cc/gallery/01.jpg",
    imageCredit: "CCSN Dataset",
    images: gallery("cc", 30, "CCSN Dataset"),
    definition: "",
    formation: "",
    // ── 종 (4개) ──
    species: [
      item("층상구름", "stratiformis", "str", "cc", "species"),
      item("렌즈구름", "lenticularis", "len", "cc", "species"),
      item("탑상구름", "castellanus",  "cas", "cc", "species"),
      item("포기구름", "floccus",      "flo", "cc", "species"),
    ],
    // ── 변종 (2개) ──
    varieties: [
      item("파상구름", "undulatus",  "un", "cc", "varieties"),
      item("벌집구름", "lacunosus",  "la", "cc", "varieties"),
    ],
    // ── 부속구름 (3개) ──
    supplementary: [
      item("미류운",   "virga",  "vir", "cc", "supplementary"),
      item("유방구름", "mamma",  "mam", "cc", "supplementary"),
      item("낙하구름", "cavum",  "cav", "cc", "supplementary"),
    ],
    physical: "",
    observation: "",
  },

  cs: {
    symbol: "Cs",
    name_ko: "권층운",
    name_en: "Cirrostratus",
    level: "high",
    level_ko: "상층운",
    composition: "얼음 결정",
    image: "/clouds/cs/gallery/01.jpg",
    imageCredit: "CCSN Dataset",
    images: gallery("cs", 30, "CCSN Dataset"),
    definition: "",
    formation: "",
    // ── 종 (2개) ──
    species: [
      item("명주실구름",   "fibratus",  "fib", "cs", "species"),
      item("안개모양구름", "nebulosus", "neb", "cs", "species"),
    ],
    // ── 변종 (2개) ──
    varieties: [
      item("이중구름", "duplicatus", "du", "cs", "varieties"),
      item("파상구름", "undulatus",  "un", "cs", "varieties"),
    ],
    // ── 부속구름 없음 ──
    supplementary: [],
    physical: "",
    observation: "",
  },

  // ══════════════════════════════════════════════════════
  // 중층운 (Middle Clouds, 2–7 km)
  // ══════════════════════════════════════════════════════

  as: {
    symbol: "As",
    name_ko: "고층운",
    name_en: "Altostratus",
    level: "mid",
    level_ko: "중층운",
    composition: "물방울 + 얼음 결정",
    image: "/clouds/as/gallery/01.jpg",
    imageCredit: "CCSN Dataset",
    images: gallery("as", 30, "CCSN Dataset"),
    definition: "",
    formation: "",
    // ── 종 없음 ──
    species: [],
    // ── 변종 (5개) ──
    varieties: [
      item("반투명구름", "translucidus", "tr", "as", "varieties"),
      item("불투명구름",  "opacus",       "op", "as", "varieties"),
      item("이중구름",   "duplicatus",   "du", "as", "varieties"),
      item("파상구름",   "undulatus",    "un", "as", "varieties"),
      item("방사구름",   "radiatus",     "ra", "as", "varieties"),
    ],
    // ── 부속구름 (4개) ──
    supplementary: [
      item("미류운",   "virga",          "vir", "as", "supplementary"),
      item("강수구름", "praecipitatio",  "pra", "as", "supplementary"),
      item("편난운",   "pannus",         "pan", "as", "supplementary"),
      item("유방구름", "mamma",          "mam", "as", "supplementary"),
    ],
    physical: "",
    observation: "",
  },

  ac: {
    symbol: "Ac",
    name_ko: "고적운",
    name_en: "Altocumulus",
    level: "mid",
    level_ko: "중층운",
    composition: "물방울 + 얼음 결정",
    image: "/clouds/ac/gallery/01.jpg",
    imageCredit: "CCSN Dataset",
    images: gallery("ac", 30, "CCSN Dataset"),
    definition: "",
    formation: "",
    // ── 종 (4개) ── ※ volutus는 고적운 종 아님 (자료 기준)
    species: [
      item("층상구름", "stratiformis", "str", "ac", "species"),
      item("렌즈구름", "lenticularis", "len", "ac", "species"),
      item("탑상구름", "castellanus",  "cas", "ac", "species"),
      item("포기구름", "floccus",      "flo", "ac", "species"),
    ],
    // ── 변종 (7개) ──
    varieties: [
      item("반투명구름", "translucidus", "tr", "ac", "varieties"),
      item("틈새구름",   "perlucidus",   "pe", "ac", "varieties"),
      item("불투명구름", "opacus",       "op", "ac", "varieties"),
      item("이중구름",   "duplicatus",   "du", "ac", "varieties"),
      item("파상구름",   "undulatus",    "un", "ac", "varieties"),
      item("방사구름",   "radiatus",     "ra", "ac", "varieties"),
      item("벌집구름",   "lacunosus",    "la", "ac", "varieties"),
    ],
    // ── 부속구름 (6개) ──
    supplementary: [
      item("물결구름", "asperitas",     "asp", "ac", "supplementary"),
      item("유방구름", "mamma",         "mam", "ac", "supplementary"),
      item("미류운",   "virga",         "vir", "ac", "supplementary"),
      item("강수구름", "praecipitatio", "pra", "ac", "supplementary"),
      item("파도구름", "fluctus",       "flu", "ac", "supplementary"),
      item("낙하구름", "cavum",         "cav", "ac", "supplementary"),
    ],
    physical: "",
    observation: "",
  },

  ns: {
    symbol: "Ns",
    name_ko: "난층운",
    name_en: "Nimbostratus",
    level: "mid",
    level_ko: "중층운",
    composition: "물방울 + 얼음 결정",
    image: "",
    imageCredit: "",
    images: [],
    definition: "",
    formation: "",
    // ── 종 없음 ──
    species: [],
    // ── 변종 없음 ──
    varieties: [],
    // ── 부속구름 (3개) ──
    supplementary: [
      item("미류운",   "virga",         "vir", "ns", "supplementary"),
      item("강수구름", "praecipitatio", "pra", "ns", "supplementary"),
      item("편난운",   "pannus",        "pan", "ns", "supplementary"),
    ],
    physical: "",
    observation: "",
  },

  // ══════════════════════════════════════════════════════
  // 하층운 (Low Clouds, 0–2 km)
  // ══════════════════════════════════════════════════════

  cu: {
    symbol: "Cu",
    name_ko: "적운",
    name_en: "Cumulus",
    level: "low",
    level_ko: "하층운",
    composition: "물방울",
    image: "",
    imageCredit: "",
    images: [],
    definition: "",
    formation: "",
    // ── 종 (4개) ──
    species: [
      item("편평운",   "humilis",    "hum", "cu", "species"),
      item("중간구름", "mediocris",  "med", "cu", "species"),
      item("봉우리구름","congestus", "con", "cu", "species"),
      item("조각구름", "fractus",   "fra", "cu", "species"),
    ],
    // ── 변종 (1개) ──
    varieties: [
      item("방사구름", "radiatus", "ra", "cu", "varieties"),
    ],
    // ── 부속구름 (8개) ──
    supplementary: [
      item("삿갓구름", "pileus",        "pil", "cu", "supplementary"),
      item("아치구름", "arcus",         "arc", "cu", "supplementary"),
      item("장막구름", "velum",         "vel", "cu", "supplementary"),
      item("미류운",   "virga",         "vir", "cu", "supplementary"),
      item("강수구름", "praecipitatio", "pra", "cu", "supplementary"),
      item("편난운",   "pannus",        "pan", "cu", "supplementary"),
      item("깔대기구름","tuba",         "tub", "cu", "supplementary"),
      item("파도구름", "fluctus",       "flu", "cu", "supplementary"),
    ],
    physical: "",
    observation: "",
  },

  cb: {
    symbol: "Cb",
    name_ko: "적란운",
    name_en: "Cumulonimbus",
    level: "low",
    level_ko: "하층운",
    composition: "물방울 + 얼음 결정",
    image: "/clouds/cb/gallery/01.jpg",
    imageCredit: "CCSN Dataset",
    images: gallery("cb", 30, "CCSN Dataset"),
    definition: "",
    formation: "",
    // ── 종 (2개) ──
    species: [
      item("대머리구름", "calvus",    "cal", "cb", "species"),
      item("복슬운",     "capillatus","cap", "cb", "species"),
    ],
    // ── 변종 없음 ──
    varieties: [],
    // ── 부속구름 (12개) ──
    supplementary: [
      item("강수구름",   "praecipitatio", "pra", "cb", "supplementary"),
      item("삿갓구름",   "pileus",        "pil", "cb", "supplementary"),
      item("미류운",     "virga",         "vir", "cb", "supplementary"),
      item("편난운",     "pannus",        "pan", "cb", "supplementary"),
      item("아치구름",   "arcus",         "arc", "cb", "supplementary"),
      item("장막구름",   "velum",         "vel", "cb", "supplementary"),
      item("깔대기구름", "tuba",          "tub", "cb", "supplementary"),
      item("모루구름",   "incus",         "inc", "cb", "supplementary"),
      item("유방구름",   "mamma",         "mam", "cb", "supplementary"),
      item("벽구름",     "murus",         "mur", "cb", "supplementary"),
      item("급류구름",   "flumen",        "flu", "cb", "supplementary"),
      item("꼬리구름",   "cauda",         "cau", "cb", "supplementary"),
    ],
    physical: "",
    observation: "",
  },

  st: {
    symbol: "St",
    name_ko: "층운",
    name_en: "Stratus",
    level: "low",
    level_ko: "하층운",
    composition: "물방울",
    image: "",
    imageCredit: "",
    images: [],
    definition: "",
    formation: "",
    // ── 종 (2개) ──
    species: [
      item("안개모양구름", "nebulosus", "neb", "st", "species"),
      item("조각구름",     "fractus",   "fra", "st", "species"),
    ],
    // ── 변종 (3개) ──
    varieties: [
      item("불투명구름", "opacus",      "op", "st", "varieties"),
      item("반투명구름", "translucidus","tr", "st", "varieties"),
      item("파상구름",   "undulatus",   "un", "st", "varieties"),
    ],
    // ── 부속구름 (1개) ──
    supplementary: [
      item("강수구름", "praecipitatio", "pra", "st", "supplementary"),
    ],
    physical: "",
    observation: "",
  },

  sc: {
    symbol: "Sc",
    name_ko: "층적운",
    name_en: "Stratocumulus",
    level: "low",
    level_ko: "하층운",
    composition: "물방울",
    image: "",
    imageCredit: "",
    images: [],
    definition: "",
    formation: "",
    // ── 종 (5개) ── ※ 자료 기준: stratiformis, lenticularis, castellanus, volutus, floccus
    species: [
      item("층상구름", "stratiformis", "str", "sc", "species"),
      item("렌즈구름", "lenticularis", "len", "sc", "species"),
      item("탑상구름", "castellanus",  "cas", "sc", "species"),
      item("회전구름", "volutus",      "vol", "sc", "species"),
      item("포기구름", "floccus",      "flo", "sc", "species"),
    ],
    // ── 변종 (7개) ──
    varieties: [
      item("반투명구름", "translucidus", "tr", "sc", "varieties"),
      item("틈새구름",   "perlucidus",   "pe", "sc", "varieties"),
      item("불투명구름", "opacus",       "op", "sc", "varieties"),
      item("이중구름",   "duplicatus",   "du", "sc", "varieties"),
      item("파상구름",   "undulatus",    "un", "sc", "varieties"),
      item("방사구름",   "radiatus",     "ra", "sc", "varieties"),
      item("벌집구름",   "lacunosus",    "la", "sc", "varieties"),
    ],
    // ── 부속구름 (5개) ──
    supplementary: [
      item("물결구름", "asperitas",     "asp", "sc", "supplementary"),
      item("유방구름", "mamma",         "mam", "sc", "supplementary"),
      item("미류운",   "virga",         "vir", "sc", "supplementary"),
      item("강수구름", "praecipitatio", "pra", "sc", "supplementary"),
      item("파도구름", "fluctus",       "flu", "sc", "supplementary"),
    ],
    physical: "",
    observation: "",
  },
};
