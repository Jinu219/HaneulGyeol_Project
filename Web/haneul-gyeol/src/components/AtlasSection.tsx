"use client";

export default function AtlasSection() {
  const cards = [
    {
      emoji: "☁️",
      type: "적운형",
      name: "적운",
      en: "Cumulus (Cu)",
      desc:
        "뭉게구름이라고도 불리는 적운은 맑은 날 하늘에서 가장 흔히 볼 수 있는 구름입니다. 솜사탕처럼 부풀어 오른 모양이 특징입니다.",
      badge: "저층운",
    },
    {
      emoji: "⛅",
      type: "적란형",
      name: "적란운",
      en: "Cumulonimbus (Cb)",
      desc:
        "천둥번개를 동반하는 거대한 구름으로, 강한 상승기류로 인해 수직으로 크게 발달합니다. 소나기와 우박을 동반하기도 합니다.",
      badge: "수직운",
    },
    {
      emoji: "🌫️",
      type: "층운형",
      name: "층운",
      en: "Stratus (St)",
      desc:
        "하늘을 회색 담요처럼 덮는 낮은 구름입니다. 안개와 비슷한 형태로 나타나며 이슬비를 내리기도 합니다.",
      badge: "저층운",
    },
    {
      emoji: "🌥️",
      type: "권운형",
      name: "권운",
      en: "Cirrus (Ci)",
      desc:
        "가느다란 깃털 모양의 하얀 구름으로, 하늘 높은 곳에 위치합니다. 날씨가 변하기 전 자주 관찰됩니다.",
      badge: "고층운",
    },
    {
      emoji: "☁️",
      type: "고적운형",
      name: "고적운",
      en: "Altocumulus (Ac)",
      desc:
        "중간 높이에 위치한 작은 덩어리 모양의 구름들이 무리지어 나타납니다. 양떼구름이라고도 불립니다.",
      badge: "중층운",
    },
    {
      emoji: "🌫️",
      type: "층적운형",
      name: "층적운",
      en: "Stratocumulus (Sc)",
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
          <div
            key={c.en}
            className="cloud-card"
            onClick={() => alert("구름 상세 페이지로 이동합니다. (개발 예정)")}
          >
            <div className="cloud-image">{c.emoji}</div>

            <div className="cloud-info">
              <div className="cloud-type">{c.type}</div>
              <h3 className="cloud-name">{c.name}</h3>
              <p className="cloud-name-en">{c.en}</p>
              <p className="cloud-description">{c.desc}</p>
              <span className="cloud-badge">{c.badge}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
