// src/app/atlas/[cloudId]/cloudData.ts

type CloudDetailItem = {
  name_ko: string;
  name_en: string;
  code: string;
  description: string;
};

type CloudDetail = {
  symbol: string;
  name_ko: string;
  name_en: string;
  level: "high" | "mid" | "low";
  level_ko: string;
  composition: string;
  definition: string;
  species: CloudDetailItem[];
  varieties: CloudDetailItem[];
  supplementary: CloudDetailItem[];
  physical: string;
  observation: string;
};

export const cloudDetailData: Record<string, CloudDetail> = {
  // 권운 (Cirrus)
  ci: {
    symbol: "Ci",
    name_ko: "권운",
    name_en: "Cirrus",
    level: "high",
    level_ko: "고층운",
    composition: "얼음 결정",
    definition: "",
    species: [
      { name_ko: "섬유상", name_en: "fibratus", code: "fib", description: "" },
      { name_ko: "갈고리상", name_en: "uncinus", code: "unc", description: "" },
      { name_ko: "농밀상", name_en: "spissatus", code: "spi", description: "" },
      { name_ko: "탑상", name_en: "castellanus", code: "cas", description: "" },
      { name_ko: "조각상", name_en: "floccus", code: "flo", description: "" },
    ],
    varieties: [
      { name_ko: "갈래상", name_en: "intortus", code: "in", description: "" },
      { name_ko: "척추상", name_en: "vertebratus", code: "ve", description: "" },
      { name_ko: "빽빽한", name_en: "densus", code: "de", description: "" },
    ],
    supplementary: [
      { name_ko: "난층운성", name_en: "nimbostratogenitus", code: "", description: "" },
      { name_ko: "복사상", name_en: "radiatus", code: "ra", description: "" },
      { name_ko: "난초상", name_en: "mamma", code: "mam", description: "" },
    ],
    physical: "",
    observation: "",
  },

  // 권적운 (Cirrocumulus)
  cc: {
    symbol: "Cc",
    name_ko: "권적운",
    name_en: "Cirrocumulus",
    level: "high",
    level_ko: "고층운",
    composition: "얼음+과냉각수",
    definition: "",
    species: [
      { name_ko: "층상", name_en: "stratiformis", code: "str", description: "" },
      { name_ko: "렌즈상", name_en: "lenticularis", code: "len", description: "" },
      { name_ko: "탑상", name_en: "castellanus", code: "cas", description: "" },
      { name_ko: "조각상", name_en: "floccus", code: "flo", description: "" },
    ],
    varieties: [
      { name_ko: "층상", name_en: "undulatus", code: "un", description: "" },
      { name_ko: "겹층", name_en: "lacunosus", code: "la", description: "" },
    ],
    supplementary: [
      { name_ko: "구멍", name_en: "virga", code: "vir", description: "" },
      { name_ko: "난초상", name_en: "mamma", code: "mam", description: "" },
    ],
    physical: "",
    observation: "",
  },

  // 권층운 (Cirrostratus)
  cs: {
    symbol: "Cs",
    name_ko: "권층운",
    name_en: "Cirrostratus",
    level: "high",
    level_ko: "고층운",
    composition: "얼음 결정",
    definition: "",
    species: [
      { name_ko: "섬유상", name_en: "fibratus", code: "fib", description: "" },
      { name_ko: "모호상", name_en: "nebulosus", code: "neb", description: "" },
    ],
    varieties: [
      { name_ko: "겹층", name_en: "duplicatus", code: "du", description: "" },
      { name_ko: "파상", name_en: "undulatus", code: "un", description: "" },
    ],
    supplementary: [
      { name_ko: "난층운성", name_en: "nimbostratogenitus", code: "", description: "" },
    ],
    physical: "",
    observation: "",
  },

  // 고층운 (Altostratus)
  as: {
    symbol: "As",
    name_ko: "고층운",
    name_en: "Altostratus",
    level: "mid",
    level_ko: "중층운",
    composition: "물+얼음",
    definition: "",
    species: [],
    varieties: [
      { name_ko: "투과상", name_en: "translucidus", code: "tr", description: "" },
      { name_ko: "불투과상", name_en: "opacus", code: "op", description: "" },
      { name_ko: "겹층", name_en: "duplicatus", code: "du", description: "" },
      { name_ko: "파상", name_en: "undulatus", code: "un", description: "" },
      { name_ko: "복사상", name_en: "radiatus", code: "ra", description: "" },
    ],
    supplementary: [
      { name_ko: "강수흔", name_en: "praecipitatio", code: "pra", description: "" },
      { name_ko: "구멍", name_en: "virga", code: "vir", description: "" },
      { name_ko: "난초상", name_en: "mamma", code: "mam", description: "" },
      { name_ko: "판누스", name_en: "pannus", code: "pan", description: "" },
    ],
    physical: "",
    observation: "",
  },

  // 고적운 (Altocumulus)
  ac: {
    symbol: "Ac",
    name_ko: "고적운",
    name_en: "Altocumulus",
    level: "mid",
    level_ko: "중층운",
    composition: "물+얼음",
    definition: "",
    species: [
      { name_ko: "층상", name_en: "stratiformis", code: "str", description: "" },
      { name_ko: "렌즈상", name_en: "lenticularis", code: "len", description: "" },
      { name_ko: "탑상", name_en: "castellanus", code: "cas", description: "" },
      { name_ko: "조각상", name_en: "floccus", code: "flo", description: "" },
      { name_ko: "소용돌이상", name_en: "volutus", code: "vol", description: "" },
    ],
    varieties: [
      { name_ko: "투과상", name_en: "translucidus", code: "tr", description: "" },
      { name_ko: "불투과상", name_en: "opacus", code: "op", description: "" },
      { name_ko: "층상", name_en: "perlucidus", code: "pe", description: "" },
      { name_ko: "겹층", name_en: "duplicatus", code: "du", description: "" },
      { name_ko: "파상", name_en: "undulatus", code: "un", description: "" },
      { name_ko: "복사상", name_en: "radiatus", code: "ra", description: "" },
      { name_ko: "겹층", name_en: "lacunosus", code: "la", description: "" },
    ],
    supplementary: [
      { name_ko: "강수흔", name_en: "praecipitatio", code: "pra", description: "" },
      { name_ko: "구멍", name_en: "virga", code: "vir", description: "" },
      { name_ko: "난초상", name_en: "mamma", code: "mam", description: "" },
    ],
    physical: "",
    observation: "",
  },

  // 난층운 (Nimbostratus)
  ns: {
    symbol: "Ns",
    name_ko: "난층운",
    name_en: "Nimbostratus",
    level: "mid",
    level_ko: "중층운",
    composition: "물+얼음",
    definition: "",
    species: [],
    varieties: [],
    supplementary: [
      { name_ko: "강수흔", name_en: "praecipitatio", code: "pra", description: "" },
      { name_ko: "구멍", name_en: "virga", code: "vir", description: "" },
      { name_ko: "판누스", name_en: "pannus", code: "pan", description: "" },
    ],
    physical: "",
    observation: "",
  },

  // 적운 (Cumulus)
  cu: {
    symbol: "Cu",
    name_ko: "적운",
    name_en: "Cumulus",
    level: "low",
    level_ko: "저층운",
    composition: "물방울",
    definition: "",
    species: [
      { name_ko: "편평상", name_en: "humilis", code: "hum", description: "" },
      { name_ko: "중간상", name_en: "mediocris", code: "med", description: "" },
      { name_ko: "웅대상", name_en: "congestus", code: "con", description: "" },
      { name_ko: "부서진", name_en: "fractus", code: "fra", description: "" },
    ],
    varieties: [
      { name_ko: "복사상", name_en: "radiatus", code: "ra", description: "" },
    ],
    supplementary: [
      { name_ko: "강수흔", name_en: "praecipitatio", code: "pra", description: "" },
      { name_ko: "구멍", name_en: "virga", code: "vir", description: "" },
      { name_ko: "아치상", name_en: "arcus", code: "arc", description: "" },
      { name_ko: "유방상", name_en: "tuba", code: "tub", description: "" },
      { name_ko: "벨룸", name_en: "velum", code: "vel", description: "" },
      { name_ko: "필레우스", name_en: "pileus", code: "pil", description: "" },
    ],
    physical: "",
    observation: "",
  },

  // 적란운 (Cumulonimbus)
  cb: {
    symbol: "Cb",
    name_ko: "적란운",
    name_en: "Cumulonimbus",
    level: "low",
    level_ko: "저층운",
    composition: "물+얼음",
    definition: "",
    species: [
      { name_ko: "대머리상", name_en: "calvus", code: "cal", description: "" },
      { name_ko: "털상", name_en: "capillatus", code: "cap", description: "" },
    ],
    varieties: [],
    supplementary: [
      { name_ko: "강수흔", name_en: "praecipitatio", code: "pra", description: "" },
      { name_ko: "구멍", name_en: "virga", code: "vir", description: "" },
      { name_ko: "난초상", name_en: "mamma", code: "mam", description: "" },
      { name_ko: "아치상", name_en: "arcus", code: "arc", description: "" },
      { name_ko: "유방상", name_en: "tuba", code: "tub", description: "" },
      { name_ko: "벨룸", name_en: "velum", code: "vel", description: "" },
      { name_ko: "필레우스", name_en: "pileus", code: "pil", description: "" },
      { name_ko: "인커스", name_en: "incus", code: "inc", description: "" },
      { name_ko: "판누스", name_en: "pannus", code: "pan", description: "" },
      { name_ko: "플라미겐니투스", name_en: "flammagenitus", code: "", description: "" },
    ],
    physical: "",
    observation: "",
  },

  // 층운 (Stratus)
  st: {
    symbol: "St",
    name_ko: "층운",
    name_en: "Stratus",
    level: "low",
    level_ko: "저층운",
    composition: "물방울",
    definition: "",
    species: [
      { name_ko: "모호상", name_en: "nebulosus", code: "neb", description: "" },
      { name_ko: "부서진", name_en: "fractus", code: "fra", description: "" },
    ],
    varieties: [
      { name_ko: "투과상", name_en: "translucidus", code: "tr", description: "" },
      { name_ko: "불투과상", name_en: "opacus", code: "op", description: "" },
      { name_ko: "파상", name_en: "undulatus", code: "un", description: "" },
    ],
    supplementary: [
      { name_ko: "강수흔", name_en: "praecipitatio", code: "pra", description: "" },
    ],
    physical: "",
    observation: "",
  },

  // 층적운 (Stratocumulus)
  sc: {
    symbol: "Sc",
    name_ko: "층적운",
    name_en: "Stratocumulus",
    level: "low",
    level_ko: "저층운",
    composition: "물방울",
    definition: "",
    species: [
      { name_ko: "층상", name_en: "stratiformis", code: "str", description: "" },
      { name_ko: "렌즈상", name_en: "lenticularis", code: "len", description: "" },
      { name_ko: "탑상", name_en: "castellanus", code: "cas", description: "" },
      { name_ko: "소용돌이상", name_en: "volutus", code: "vol", description: "" },
    ],
    varieties: [
      { name_ko: "투과상", name_en: "translucidus", code: "tr", description: "" },
      { name_ko: "불투과상", name_en: "opacus", code: "op", description: "" },
      { name_ko: "층상", name_en: "perlucidus", code: "pe", description: "" },
      { name_ko: "겹층", name_en: "duplicatus", code: "du", description: "" },
      { name_ko: "파상", name_en: "undulatus", code: "un", description: "" },
      { name_ko: "복사상", name_en: "radiatus", code: "ra", description: "" },
      { name_ko: "겹층", name_en: "lacunosus", code: "la", description: "" },
    ],
    supplementary: [
      { name_ko: "강수흔", name_en: "praecipitatio", code: "pra", description: "" },
      { name_ko: "구멍", name_en: "virga", code: "vir", description: "" },
      { name_ko: "난초상", name_en: "mamma", code: "mam", description: "" },
    ],
    physical: "",
    observation: "",
  },
};
