// src/components/atlas/CloudCard.tsx
"use client";

import { useRouter } from "next/navigation";
import "./CloudCard.css";

export type CloudData = {
  symbol: string;
  name_ko: string;
  name_en: string;
  emoji: string;
  type: string;
  level: "high" | "mid" | "low";
  description: string;
  composition: string;
  speciesCount?: number;
};

type CloudCardProps = {
  cloud: CloudData;
};

export default function CloudCard({ cloud }: CloudCardProps) {
  const router = useRouter();

  const handleClick = () => {
    // 구름 상세 페이지로 라우팅
    router.push(`/atlas/${cloud.symbol.toLowerCase()}`);
  };

  return (
    <div
      className={`cloud-card ${cloud.level}-cloud`}
      data-name={`${cloud.name_ko} ${cloud.name_en}`.toLowerCase()}
      onClick={handleClick}
    >
      <div className="cloud-image">{cloud.emoji}</div>
      <div className="cloud-info">
        <div className="cloud-header">
          <div className="cloud-type">{cloud.type}</div>
          <div className="cloud-symbol">{cloud.symbol}</div>
        </div>
        <h3 className="cloud-name">{cloud.name_ko}</h3>
        <p className="cloud-name-en">{cloud.name_en}</p>
        <p className="cloud-description">{cloud.description}</p>
        <div className="cloud-meta">
          {/* <span className="meta-badge">{getLevelBadge(cloud.level)}</span> */}
          {/* <span className="meta-badge">{cloud.composition}</span> */}
          {cloud.speciesCount !== undefined && cloud.speciesCount > 0 && (
            <span className="meta-badge">{cloud.speciesCount}종</span>
          )}
        </div>
        <div className="cloud-details-link">자세히 보기 →</div>
      </div>
    </div>
  );
}

function getLevelBadge(level: string): string {
  switch (level) {
    case "high":
      return "고층운";
    case "mid":
      return "중층운";
    case "low":
      return "저층운";
    default:
      return "";
  }
}
