"use client";

import Link from "next/link";

export default function AtlasSection() {
  const cards = [
    // 고층운 (3개)
    {
      symbol: "Ci",
      emoji: "🌥️",
      type: "고층운",
      name: "권운",
      en: "Cirrus",
      desc:
        "가느다란 깃털 모양의 하얀 구름으로, 하늘 높은 곳에 위치합니다. 날씨가 변하기 전 자주 관찰됩니다.",
      badge: "고층운",
    },
    {
      symbol: "Cc",
      emoji: "🌤️",
      type: "고층운",
      name: "권적운",
      en: "Cirrocumulus",
      desc:
        "작고 하얀 알갱이 모양의 구름들이 물결처럼 배열된 모습이 특징입니다. 매우 높은 하늘에 나타나며, 보통 맑은 날씨와 함께 관찰됩니다.",
      badge: "고층운",
    },
    {
      symbol: "Cs",
      emoji: "🌥️",
      type: "고층운",
      name: "권층운",
      en: "Cirrostratus",
      desc:
        "하늘을 얇은 베일처럼 덮는 투명한 구름으로, 태양이나 달 주위에 무리(halo)를 만들기도 합니다. 날씨 변화의 신호로 자주 나타납니다.",
      badge: "고층운",
    },
    // 중층운 (3개)
    {
      symbol: "As",
      emoji: "🌥️",
      type: "중층운",
      name: "고층운",
      en: "Altostratus",
      desc:
        "하늘을 넓게 덮는 회백색의 구름으로, 태양이 희미한 원반처럼 보이게 만듭니다. 비나 눈이 오기 전 단계에서 자주 나타납니다.",
      badge: "중층운",
    },
    {
      symbol: "Ac",
      emoji: "☁️",
      type: "중층운",
      name: "고적운",
      en: "Altocumulus",
      desc:
        "중간 높이에 위치한 작은 덩어리 모양의 구름들이 무리지어 나타납니다. 양떼구름이라고도 불립니다.",
      badge: "중층운",
    },
    {
      symbol: "Ns",
      emoji: "🌧️",
      type: "중층운",
      name: "난층운",
      en: "Nimbostratus",
      desc:
        "하늘 전체를 두껍게 덮으며 오랜 시간 비나 눈을 내리는 구름입니다. 태양이 보이지 않을 정도로 하늘을 어둡게 만들며, 지속적인 강수를 동반합니다.",
      badge: "중층운",
    },
    // 저층운 (4개)
    {
      symbol: "Cu",
      emoji: "☁️",
      type: "저층운",
      name: "적운",
      en: "Cumulus",
      desc:
        "뭉게구름이라고도 불리는 적운은 맑은 날 하늘에서 가장 흔히 볼 수 있는 구름입니다. 솜사탕처럼 부풀어 오른 모양이 특징입니다.",
      badge: "저층운",
    },
    {
      symbol: "Cb",
      emoji: "⛈️",
      type: "저층운",
      name: "적란운",
      en: "Cumulonimbus",
      desc:
        "천둥번개를 동반하는 거대한 구름으로, 강한 상승기류로 인해 수직으로 크게 발달합니다. 소나기와 우박을 동반하기도 합니다.",
      badge: "저층운",
    },
    {
      symbol: "St",
      emoji: "🌫️",
      type: "저층운",
      name: "층운",
      en: "Stratus",
      desc:
        "하늘을 회색 담요처럼 덮는 낮은 구름입니다. 안개와 비슷한 형태로 나타나며 이슬비를 내리기도 합니다.",
      badge: "저층운",
    },
    {
      symbol: "Sc",
      emoji: "🌫️",
      type: "저층운",
      name: "층적운",
      en: "Stratocumulus",
      desc:
        "회색이나 흰색의 덩어리들이 층을 이루며 펼쳐진 구름입니다. 적운과 층운의 특징을 모두 가지고 있습니다.",
      badge: "저층운",
    },
  ];

  return (
    <section className="atlas-section" id="atlas">
      <h2 className="section-title">구름 도감</h2>
      <p className="section-subtitle">다양한 구름의 종류를 탐험해보세요</p>

      <div className="cloud-grid">
        {cards.map((c) => (
          <div key={c.en} className="cloud-card">
            <div className="cloud-image">{c.emoji}</div>

            <div className="cloud-info">
              <div className="cloud-header">
                <div className="cloud-type">{c.type}</div>
                <div className="cloud-symbol">{c.symbol}</div>
              </div>
              <h3 className="cloud-name">{c.name}</h3>
              <p className="cloud-name-en">{c.en}</p>
              <p className="cloud-description">{c.desc}</p>
              <span className="cloud-badge">{c.badge}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 전체 구름 도감으로 이동하는 버튼 */}
      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <Link href="/atlas" className="cta-button">
          전체 구름 도감 보기
        </Link>
      </div>
    </section>
  );
}
