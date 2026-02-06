// src/components/atlas/CloudLevelSection.tsx
"use client";

import CloudCard, { CloudData } from "./CloudCard";

type CloudLevelSectionProps = {
  level: "high" | "mid" | "low";
  title: string;
  subtitle: string;
  altitude: string;
  altitudeDetail: string;
  icon: string;
  activeFilter: string;
  searchTerm: string;
};

// 구름 데이터 (WMO 기준에 따른 정확한 종 개수)
const cloudDatabase: Record<string, CloudData[]> = {
  high: [
    {
      symbol: "Ci",
      name_ko: "권운",
      name_en: "Cirrus",
      emoji: "🌤️",
      type: "고층운",
      level: "high",
      description:
        "가느다란 흰색 실 모양이나 좁은 띠 모양의 구름입니다. 섬세한 깃털 같은 외관을 가지며, 하늘 높은 곳에 위치하여 날씨 변화의 전조로 여겨집니다.",
      composition: "얼음 결정",
      speciesCount: 5, // fibratus, uncinus, spissatus, castellanus, floccus
    },
    {
      symbol: "Cc",
      name_ko: "권적운",
      name_en: "Cirrocumulus",
      emoji: "☁️",
      type: "고층운",
      level: "high",
      description:
        "작고 흰 알갱이나 잔물결 모양으로 배열된 구름입니다. 얇은 층이나 조각으로 나타나며, 그림자가 없는 것이 특징입니다. '고등어 구름'이라고도 불립니다.",
      composition: "얼음+과냉각수",
      speciesCount: 4, // stratiformis, lenticularis, castellanus, floccus
    },
    {
      symbol: "Cs",
      name_ko: "권층운",
      name_en: "Cirrostratus",
      emoji: "🌫️",
      type: "고층운",
      level: "high",
      description:
        "하늘을 균일하게 덮는 투명한 흰색 베일 같은 구름입니다. 해와 달 주위에 후광(halo)을 만들며, 전선 접근의 신호가 될 수 있습니다.",
      composition: "얼음 결정",
      speciesCount: 2, // fibratus, nebulosus
    },
  ],
  mid: [
    {
      symbol: "As",
      name_ko: "고층운",
      name_en: "Altostratus",
      emoji: "🌥️",
      type: "중층운",
      level: "mid",
      description:
        "하늘을 균일하게 덮는 회색 또는 청회색의 층운입니다. 해나 달을 희미하게 볼 수 있으며, 지속적인 비나 눈을 예고하는 경우가 많습니다.",
      composition: "물+얼음",
      speciesCount: 0, // 고층운은 종이 없음
    },
    {
      symbol: "Ac",
      name_ko: "고적운",
      name_en: "Altocumulus",
      emoji: "☁️",
      type: "중층운",
      level: "mid",
      description:
        "회색 또는 흰색의 덩어리나 층으로 나타나는 구름입니다. 개별 요소가 권적운보다 크며, 부분적으로 그림자를 드리웁니다. '양떼 구름'이라고도 불립니다.",
      composition: "물+얼음",
      speciesCount: 5, // stratiformis, lenticularis, castellanus, floccus, volutus
    },
    {
      symbol: "Ns",
      name_ko: "난층운",
      name_en: "Nimbostratus",
      emoji: "🌧️",
      type: "중층운",
      level: "mid",
      description:
        "어둡고 두꺼운 회색 층운으로 하늘을 완전히 덮습니다. 지속적인 비나 눈을 동반하며, 해나 달을 완전히 가려버립니다.",
      composition: "물+얼음",
      speciesCount: 0, // 난층운은 종이 없음
    },
  ],
  low: [
    {
      symbol: "Cu",
      name_ko: "적운",
      name_en: "Cumulus",
      emoji: "☁️",
      type: "저층운",
      level: "low",
      description:
        "밝은 햇빛에 비춰진 뚜렷한 윤곽의 솜뭉치 같은 구름입니다. '뭉게구름'이라고도 불리며, 맑은 날씨에 자주 관찰됩니다.",
      composition: "물방울",
      speciesCount: 4, // humilis, mediocris, congestus, fractus
    },
    {
      symbol: "Cb",
      name_ko: "적란운",
      name_en: "Cumulonimbus",
      emoji: "⛈️",
      type: "저층운",
      level: "low",
      description:
        "거대하고 무거운 구름으로 산처럼 우뚝 솟아있습니다. 천둥, 번개, 폭우, 우박을 동반하는 기상학적으로 가장 강력한 구름입니다.",
      composition: "물+얼음",
      speciesCount: 2, // calvus, capillatus
    },
    {
      symbol: "St",
      name_ko: "층운",
      name_en: "Stratus",
      emoji: "🌫️",
      type: "저층운",
      level: "low",
      description:
        "균일한 회색 층으로 나타나는 구름입니다. 안개가 떠오른 것처럼 보이며, 이슬비나 눈 알갱이를 내릴 수 있습니다.",
      composition: "물방울",
      speciesCount: 2, // nebulosus, fractus
    },
    {
      symbol: "Sc",
      name_ko: "층적운",
      name_en: "Stratocumulus",
      emoji: "🌫️",
      type: "저층운",
      level: "low",
      description:
        "회색이나 흰색 덩어리가 층을 이루며 배열된 구름입니다. 대부분 전체 또는 일부가 어둡고, 약한 비나 이슬비를 내릴 수 있습니다.",
      composition: "물방울",
      speciesCount: 4, // stratiformis, lenticularis, castellanus, volutus
    },
  ],
};

export default function CloudLevelSection({
  level,
  title,
  subtitle,
  altitude,
  altitudeDetail,
  icon,
  activeFilter,
  searchTerm,
}: CloudLevelSectionProps) {
  const clouds = cloudDatabase[level] || [];

  // 필터링
  const shouldShow = activeFilter === "all" || activeFilter === level;

  // 검색 필터링
  const filteredClouds = clouds.filter((cloud) => {
    if (!searchTerm) return true;

    const q = searchTerm.toLowerCase().replace(/\s+/g, "");
    const ko = cloud.name_ko.toLowerCase().replace(/\s+/g, "");
    const en = cloud.name_en.toLowerCase().replace(/\s+/g, "");
    const sym = cloud.symbol.toLowerCase().replace(/\s+/g, "");

    return ko.includes(q) || en.includes(q) || sym.includes(q);
  });


  if (!shouldShow) return null;
  

  return (
    <section className="cloud-level-section" data-level={level} id={`level-${level}`}>
      <div className={`level-header ${level}`}>
        <div className="level-icon">{icon}</div>
        <div className="level-title">
          <h2>{title}</h2>
          <p className="subtitle">{subtitle}</p>
        </div>
        <div className="altitude-info">
          <strong>{altitude}</strong>
          <span>{altitudeDetail}</span>
        </div>
      </div>

      {filteredClouds.length > 0 ? (
        <div className="cloud-grid">
          {filteredClouds.map((cloud) => (
            <CloudCard key={cloud.symbol} cloud={cloud} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-title">검색 결과가 없어요</div>
          <div className="empty-desc">
            다른 키워드로 검색해보세요 (예: 적운, Cu, Cumulus)
          </div>
        </div>
      )}

    </section>
  );
}
