// src/components/atlas/RelatedCloudsPanel.tsx
// 구름 상세 페이지 + 종/변종/부속 상세 페이지 양쪽에서 공유하는 탐색 패널
// 4개 열: Genera / Species / Varieties / SFAC

"use client";

import Link from "next/link";
import { cloudDetailData } from "@/app/atlas/[cloudId]/cloudData";

// ── 타입 ──────────────────────────────────────────────────────
type Category = "species" | "varieties" | "supplementary";

interface SubEntry {
  nameKo: string;
  nameEn: string;
  code: string;
}

// ── 유니크 서브아이템 수집 헬퍼 ──────────────────────────────
function collectUnique(category: Category): SubEntry[] {
  const seen = new Set<string>();
  const result: SubEntry[] = [];

  Object.values(cloudDetailData).forEach((cloud) => {
    (cloud[category] ?? []).forEach((item) => {
      if (!seen.has(item.name_en)) {
        seen.add(item.name_en);
        result.push({
          nameKo: item.name_ko,
          nameEn: item.name_en,
          code:   item.code,
        });
      }
    });
  });

  return result;
}

// 레벨 메타
const LEVEL_META = {
  high: { color: "#4a90e2", bg: "#E3F2FD" },
  mid:  { color: "#0277bd", bg: "#B3E5FC" },
  low:  { color: "#00838f", bg: "#B2EBF2" },
} as const;

// 카테고리별 색상
const CAT_COLOR: Record<Category, { color: string; bg: string }> = {
  species:       { color: "#e65100", bg: "#fff3e0" },
  varieties:     { color: "#f57f17", bg: "#fffde7" },
  supplementary: { color: "#2e7d32", bg: "#e8f5e9" },
};

// ── 컴포넌트 Props ────────────────────────────────────────────
interface Props {
  /** 현재 보고 있는 구름 속 ID (cloud detail 페이지용, 없으면 undefined) */
  currentCloudId?: string;
  /** 현재 보고 있는 카테고리 + subName (sub detail 페이지용) */
  currentSub?: { category: Category; nameEn: string };
}

export default function RelatedCloudsPanel({ currentCloudId, currentSub }: Props) {
  const genera    = Object.entries(cloudDetailData);
  const species   = collectUnique("species");
  const varieties = collectUnique("varieties");
  const sfac      = collectUnique("supplementary");

  const COLUMNS = [
    {
      id: "genera" as const,
      label: "운형 (Genera)",
      sublabel: "10종",
      headerColor: "#334155",
      headerBg: "#f1f5f9",
    },
    {
      id: "species" as const,
      label: "종 (Species)",
      sublabel: `${species.length}종`,
      headerColor: CAT_COLOR.species.color,
      headerBg: CAT_COLOR.species.bg,
    },
    {
      id: "varieties" as const,
      label: "변종 (Varieties)",
      sublabel: `${varieties.length}종`,
      headerColor: CAT_COLOR.varieties.color,
      headerBg: CAT_COLOR.varieties.bg,
    },
    {
      id: "sfac" as const,
      label: "부속 (SFAC)",
      sublabel: `${sfac.length}종`,
      headerColor: CAT_COLOR.supplementary.color,
      headerBg: CAT_COLOR.supplementary.bg,
    },
  ];

  return (
    <section className="rcp-section">
      <div className="rcp-header-row">
        <h2 className="rcp-title">🗺️ 구름 탐색</h2>
        <Link href="/atlas/taxonomy" className="rcp-all-link">
          종/변종/부속 전체 목록 →
        </Link>
      </div>

      <div className="rcp-table">
        {/* 열 헤더 */}
        <div className="rcp-col-headers">
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              className="rcp-col-header"
              style={{ color: col.headerColor, background: col.headerBg }}
            >
              <span className="rcp-col-label">{col.label}</span>
              <span className="rcp-col-sub">{col.sublabel}</span>
            </div>
          ))}
        </div>

        {/* 열 내용 */}
        <div className="rcp-col-body">

          {/* ① Genera */}
          <div className="rcp-col-items">
            {genera.map(([id, cloud]) => {
              const isCurrent = id === currentCloudId;
              const lvl       = LEVEL_META[cloud.level];
              return (
                <Link
                  key={id}
                  href={`/atlas/${id}`}
                  className={`rcp-chip rcp-chip--genera${isCurrent ? " rcp-chip--current" : ""}`}
                  style={isCurrent
                    ? { background: lvl.color, borderColor: lvl.color }
                    : { borderColor: lvl.color + "55", background: lvl.bg }
                  }
                  aria-current={isCurrent ? "page" : undefined}
                >
                  <span className="rcp-chip-sym"
                    style={{ color: isCurrent ? "#fff" : lvl.color }}>
                    {cloud.symbol}
                  </span>
                  <span className="rcp-chip-name"
                    style={{ color: isCurrent ? "#fff" : "#1e293b" }}>
                    {cloud.name_ko}
                  </span>
                  {isCurrent && <span className="rcp-chip-now">현재</span>}
                </Link>
              );
            })}
          </div>

          {/* ② Species */}
          <div className="rcp-col-items">
            {species.map((s) => {
              const isCurrent = currentSub?.category === "species" && currentSub.nameEn === s.nameEn;
              const cc = CAT_COLOR.species;
              return (
                <Link
                  key={s.nameEn}
                  href={`/atlas/sub/species/${s.nameEn}`}
                  className={`rcp-chip rcp-chip--sub${isCurrent ? " rcp-chip--current" : ""}`}
                  style={isCurrent
                    ? { background: cc.color, borderColor: cc.color }
                    : { borderColor: cc.color + "55", background: cc.bg }
                  }
                >
                  <span className="rcp-chip-code"
                    style={{ color: isCurrent ? "#fff" : cc.color }}>
                    {s.code}
                  </span>
                  <span className="rcp-chip-name"
                    style={{ color: isCurrent ? "#fff" : "#1e293b" }}>
                    {s.nameKo}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* ③ Varieties */}
          <div className="rcp-col-items">
            {varieties.map((v) => {
              const isCurrent = currentSub?.category === "varieties" && currentSub.nameEn === v.nameEn;
              const cc = CAT_COLOR.varieties;
              return (
                <Link
                  key={v.nameEn}
                  href={`/atlas/sub/varieties/${v.nameEn}`}
                  className={`rcp-chip rcp-chip--sub${isCurrent ? " rcp-chip--current" : ""}`}
                  style={isCurrent
                    ? { background: cc.color, borderColor: cc.color }
                    : { borderColor: cc.color + "55", background: cc.bg }
                  }
                >
                  <span className="rcp-chip-code"
                    style={{ color: isCurrent ? "#fff" : cc.color }}>
                    {v.code}
                  </span>
                  <span className="rcp-chip-name"
                    style={{ color: isCurrent ? "#fff" : "#1e293b" }}>
                    {v.nameKo}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* ④ SFAC */}
          <div className="rcp-col-items">
            {sfac.map((s) => {
              const isCurrent = currentSub?.category === "supplementary" && currentSub.nameEn === s.nameEn;
              const cc = CAT_COLOR.supplementary;
              return (
                <Link
                  key={s.nameEn}
                  href={`/atlas/sub/supplementary/${s.nameEn}`}
                  className={`rcp-chip rcp-chip--sub${isCurrent ? " rcp-chip--current" : ""}`}
                  style={isCurrent
                    ? { background: cc.color, borderColor: cc.color }
                    : { borderColor: cc.color + "55", background: cc.bg }
                  }
                >
                  <span className="rcp-chip-code"
                    style={{ color: isCurrent ? "#fff" : cc.color }}>
                    {s.code}
                  </span>
                  <span className="rcp-chip-name"
                    style={{ color: isCurrent ? "#fff" : "#1e293b" }}>
                    {s.nameKo}
                  </span>
                </Link>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
