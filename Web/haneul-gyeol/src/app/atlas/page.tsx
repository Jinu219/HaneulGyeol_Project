// src/app/atlas/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import FilterBar from "@/components/atlas/FilterBar";
import CloudLevelSection from "@/components/atlas/CloudLevelSection";
import { cloudDetailData } from "@/app/atlas/[cloudId]/cloudData";
import "./atlas.css";

// ── 타입 ──────────────────────────────────────────────────────
type MainTab = "all" | "genera" | "species" | "varieties" | "supplementary";
type SubCat  = "species" | "varieties" | "supplementary";

// ── 탭 메타 ──────────────────────────────────────────────────
const TAB_META: Record<MainTab, {
  ko: string; en: string; count: string; desc: string;
  color: string; bg: string; border: string; emoji: string;
}> = {
  all: {
    ko: "전체", en: "All", count: "49",
    desc: "운형 10종과 종·변종·부속 구름 전체를 한눈에 탐색",
    color: "#334155", bg: "#f1f5f9", border: "#cbd5e1", emoji: "🌐",
  },
  genera: {
    ko: "구름 속", en: "Genera", count: "10",
    desc: "기본적인 구름의 형태와 고도에 따라 분류되는 10가지 주요 구름 종류",
    color: "#2c7be5", bg: "#e8f3ff", border: "#93c5fd", emoji: "☁️",
  },
  species: {
    ko: "구름 종", en: "Species", count: "15",
    desc: "구름의 형태와 구조적 특징에 따른 세부 분류",
    color: "#e65100", bg: "#fff3e0", border: "#ffcc80", emoji: "🔬",
  },
  varieties: {
    ko: "변종", en: "Varieties", count: "9",
    desc: "투명도와 배열 패턴에 따른 추가 분류",
    color: "#f57f17", bg: "#fffde7", border: "#fff176", emoji: "🎨",
  },
  supplementary: {
    ko: "부속 구름 등", en: "SFAC", count: "15",
    desc: "보조 특징, 부속 구름 및 특수 구름 형태",
    color: "#2e7d32", bg: "#e8f5e9", border: "#a5d6a7", emoji: "✨",
  },
};

// 레벨 색상
const LEVEL_COLOR: Record<string, { color: string; bg: string; label: string }> = {
  high: { color: "#4a90e2", bg: "#E3F2FD", label: "상층운" },
  mid:  { color: "#0277bd", bg: "#B3E5FC", label: "중층운" },
  low:  { color: "#00838f", bg: "#B2EBF2", label: "저층운" },
};

// ── 유니크 서브아이템 수집 ────────────────────────────────────
function collectUnique(cat: SubCat) {
  const map = new Map<string, {
    nameKo: string; nameEn: string; code: string;
    thumbnail: string | null;
    inClouds: { id: string; symbol: string; nameKo: string; level: string }[];
  }>();

  Object.entries(cloudDetailData).forEach(([id, cloud]) => {
    (cloud[cat] ?? []).forEach((item) => {
      if (!map.has(item.name_en)) {
        map.set(item.name_en, {
          nameKo: item.name_ko,
          nameEn: item.name_en,
          code:   item.code,
          thumbnail: item.images?.[0]?.src ?? null,
          inClouds: [],
        });
      }
      map.get(item.name_en)!.inClouds.push({
        id, symbol: cloud.symbol, nameKo: cloud.name_ko, level: cloud.level,
      });
    });
  });

  return Array.from(map.values()).sort(
    (a, b) => b.inClouds.length - a.inClouds.length
  );
}

// ── Sub 카드 (종/변종/부속 공통) ─────────────────────────────
interface SubCardItem {
  nameKo: string; nameEn: string; code: string;
  thumbnail: string | null;
  inClouds: { id: string; symbol: string; nameKo: string; level: string }[];
}

function SubCard({
  item, cat, variant = "default",
}: {
  item: SubCardItem;
  cat: SubCat;
  variant?: "default" | "compact";
}) {
  const meta = TAB_META[cat];
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/atlas/sub/${cat}/${item.nameEn}`}
      className={`stc-card stc-card--${variant}`}
      style={{ "--cat-color": meta.color, "--cat-bg": meta.bg } as React.CSSProperties}
    >
      {/* 썸네일 이미지 영역 */}
      <div className="stc-thumb" style={{ background: meta.bg }}>
        {item.thumbnail && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail}
            alt={item.nameKo}
            className="stc-thumb-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="stc-thumb-fallback">
            <span className="stc-thumb-emoji">{meta.emoji}</span>
            <span className="stc-thumb-code" style={{ color: meta.color }}>
              {item.code}
            </span>
          </div>
        )}
        {/* 코드 뱃지 (이미지 위에 오버레이) */}
        {item.thumbnail && !imgError && (
          <span
            className="stc-thumb-badge"
            style={{ color: meta.color, background: meta.bg + "ee" }}
          >
            {item.code}
          </span>
        )}
      </div>

      {/* 카드 정보 */}
      <div className="stc-body">
        <div className="stc-names">
          <span className="stc-ko">{item.nameKo}</span>
          <span className="stc-en">{item.nameEn}</span>
        </div>

        {/* 출현 구름 */}
        <div className="stc-clouds">
          {item.inClouds.map((c) => {
            const lv = LEVEL_COLOR[c.level];
            return (
              <span key={c.id} className="stc-cloud-chip"
                style={{ color: lv.color, background: lv.bg, border: `1px solid ${lv.color}33` }}>
                {c.symbol}
              </span>
            );
          })}
        </div>

        <span className="stc-cta" style={{ color: meta.color }}>
          자세히 보기 →
        </span>
      </div>
    </Link>
  );
}

// ── Sub 탭 콘텐츠 ─────────────────────────────────────────────
function SubTabContent({ cat, searchTerm }: { cat: SubCat; searchTerm: string }) {
  const meta  = TAB_META[cat];
  const items = useMemo(() => collectUnique(cat), [cat]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.nameKo.includes(q) ||
        i.nameEn.toLowerCase().includes(q) ||
        i.code.toLowerCase().includes(q) ||
        i.inClouds.some((c) => c.nameKo.includes(q) || c.symbol.toLowerCase().includes(q))
    );
  }, [items, searchTerm]);

  return (
    <div className="sub-tab-content">
      <div className="sub-tab-header"
        style={{ borderColor: meta.border, background: meta.bg }}>
        <div className="sub-tab-header-top">
          <span className="sub-tab-emoji">{meta.emoji}</span>
          <h2 className="sub-tab-title" style={{ color: meta.color }}>
            {meta.ko}
            <span className="sub-tab-en"> ({meta.en})</span>
          </h2>
          <span className="sub-tab-count"
            style={{ color: meta.color, background: meta.border + "88" }}>
            {filtered.length}종
          </span>
        </div>
        <p className="sub-tab-desc">{meta.desc}</p>
      </div>

      {filtered.length === 0 ? (
        <div className="sub-tab-empty"><p>검색 결과가 없습니다.</p></div>
      ) : (
        <div className="sub-tab-grid">
          {filtered.map((item) => (
            <SubCard key={item.nameEn} item={item} cat={cat} variant="default" />
          ))}
        </div>
      )}
    </div>
  );
}

// ── 전체 뷰 (운형 왼쪽 + 나머지 오른쪽) ─────────────────────
function AllView({ searchTerm }: { searchTerm: string }) {
  const allCats: SubCat[] = ["species", "varieties", "supplementary"];
  const q = searchTerm.trim().toLowerCase();

  // 각 카테고리 데이터
  const catData = useMemo(() =>
    allCats.reduce((acc, cat) => {
      const items = collectUnique(cat);
      acc[cat] = q
        ? items.filter((i) =>
            i.nameKo.includes(q) ||
            i.nameEn.toLowerCase().includes(q) ||
            i.code.toLowerCase().includes(q) ||
            i.inClouds.some((c) => c.nameKo.includes(q) || c.symbol.toLowerCase().includes(q))
          )
        : items;
      return acc;
    }, {} as Record<SubCat, ReturnType<typeof collectUnique>>),
  [q]);

  // 운형 필터
  const genera = useMemo(() => {
    if (!q) return Object.entries(cloudDetailData);
    return Object.entries(cloudDetailData).filter(([, c]) =>
      c.name_ko.includes(q) ||
      c.name_en.toLowerCase().includes(q) ||
      c.symbol.toLowerCase().includes(q)
    );
  }, [q]);

  return (
    <div className="all-view">
      {/* ── 왼쪽: 운형 ── */}
      <div className="all-view-left">
        <div className="all-section-header"
          style={{ borderColor: TAB_META.genera.border, background: TAB_META.genera.bg }}>
          <span className="all-section-emoji">{TAB_META.genera.emoji}</span>
          <div>
            <h3 className="all-section-title" style={{ color: TAB_META.genera.color }}>
              운형 <span className="all-section-en">(Genera)</span>
            </h3>
            <p className="all-section-count">{genera.length}종</p>
          </div>
        </div>

        <div className="all-genera-list">
          {genera.map(([id, cloud]) => {
            const lv = LEVEL_COLOR[cloud.level];
            const [imgErr, setImgErr] = useState(false);
            return (
              <Link key={id} href={`/atlas/${id}`} className="all-genera-card">
                {/* 이미지 영역 */}
                <div className="all-genera-thumb" style={{ background: lv.bg }}>
                  {cloud.image && !imgErr ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cloud.image}
                      alt={cloud.name_ko}
                      className="all-genera-thumb-img"
                      onError={() => setImgErr(true)}
                    />
                  ) : (
                    <span className="all-genera-thumb-sym" style={{ color: lv.color }}>
                      {cloud.symbol}
                    </span>
                  )}
                </div>
                {/* 정보 */}
                <div className="all-genera-info">
                  <div className="all-genera-name-row">
                    <span className="all-genera-ko">{cloud.name_ko}</span>
                    <span className="all-genera-level"
                      style={{ color: lv.color, background: lv.bg }}>
                      {lv.label}
                    </span>
                  </div>
                  <span className="all-genera-en">{cloud.name_en}</span>
                  <span className="all-genera-sym"
                    style={{ color: lv.color, background: lv.bg + "cc" }}>
                    {cloud.symbol}
                  </span>
                </div>
                <span className="all-genera-arrow">›</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── 오른쪽: 종/변종/부속 ── */}
      <div className="all-view-right">
        {allCats.map((cat) => {
          const meta  = TAB_META[cat];
          const items = catData[cat];
          return (
            <div key={cat} className="all-sub-section">
              <div className="all-section-header"
                style={{ borderColor: meta.border, background: meta.bg }}>
                <span className="all-section-emoji">{meta.emoji}</span>
                <div>
                  <h3 className="all-section-title" style={{ color: meta.color }}>
                    {meta.ko} <span className="all-section-en">({meta.en})</span>
                  </h3>
                  <p className="all-section-count">{items.length}종</p>
                </div>
              </div>

              <div className="all-sub-grid">
                {items.slice(0, 12).map((item) => (
                  <Link
                    key={item.nameEn}
                    href={`/atlas/sub/${cat}/${item.nameEn}`}
                    className="all-sub-chip"
                    style={{
                      borderColor: meta.border,
                      background: meta.bg,
                      "--cat-color": meta.color,
                    } as React.CSSProperties}
                  >
                    <span className="all-sub-code" style={{ color: meta.color }}>
                      {item.code}
                    </span>
                    <span className="all-sub-name">{item.nameKo}</span>
                  </Link>
                ))}
                {items.length > 12 && (
                  <button
                    className="all-sub-more"
                    style={{ borderColor: meta.border, color: meta.color }}
                    onClick={() => {/* 탭 전환은 부모에서 처리 */}}
                  >
                    +{items.length - 12}개 더 보기
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────
export default function AtlasPage() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm,   setSearchTerm]   = useState<string>("");
  const [debounced,    setDebounced]     = useState<string>("");
  const [mainTab,      setMainTab]       = useState<MainTab>("genera");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchTerm), 200);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const tabs: MainTab[] = ["all", "genera", "species", "varieties", "supplementary"];

  const searchPlaceholders: Record<MainTab, string> = {
    all: "전체 검색... (예: 권운, radiatus, mam)",
    genera: "구름 이름으로 검색... (예: 적운, Cumulus, Cu)",
    species: "구름 종 검색... (예: 명주실구름, fibratus, fib)",
    varieties: "변종 검색... (예: 방사구름, radiatus, ra)",
    supplementary: "부속 구름 검색... (예: 유방구름, mamma, mam)",
  };

  return (
    <>
      {/* Navbar */}
      <nav className="atlas-nav">
        <Link href="/" className="logo">하늘결</Link>
        <ul className="nav-links">
          <li><Link href="/">홈</Link></li>
          <li><Link href="/#ai">AI 식별</Link></li>
          <li><Link href="/atlas" className="active">구름 도감</Link></li>
          <li><Link href="/#about">소개</Link></li>
        </ul>
      </nav>

      {/* Header */}
      <section className="atlas-header">
        <h1>구름 도감</h1>
        <p>
          세계기상기구(WMO) 국제구름사전을 기반으로 한 구름 분류 체계입니다.
          <br />
          10가지 주요 구름 속(Genera)과 그 변종들을 탐험해보세요.
        </p>
        <div className="reference-note">
          📚 참고:{" "}
          <a href="https://cloudatlas.wmo.int/en/home.html" target="_blank" rel="noreferrer">
            WMO International Cloud Atlas
          </a>
        </div>
      </section>

      {/* 고도 필터바 — genera 탭에서만 */}
      {mainTab === "genera" && (
        <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      )}

      {/* ── Classification Info ── */}
      <section className="classification-info">
        <div className="info-grid">
          {tabs.map((tab) => {
            const m        = TAB_META[tab];
            const isActive = mainTab === tab;
            return (
              <button
                key={tab}
                className={`info-card info-card--tab${isActive ? " info-card--active" : ""}`}
                onClick={() => { setMainTab(tab); setSearchTerm(""); }}
                style={isActive
                  ? { borderLeftColor: m.color, background: m.bg, outline: `2.5px solid ${m.color}` }
                  : { borderLeftColor: m.color }
                }
              >
                <div className="info-card-top">
                  <span className="info-emoji">{m.emoji}</span>
                  <div className="count" style={isActive ? { color: m.color } : {}}>{m.count}</div>
                </div>
                <h3 style={isActive ? { color: m.color } : {}}>
                  {m.ko}
                  <span className="info-en"> ({m.en})</span>
                </h3>
                <p>{m.desc}</p>
                {isActive && (
                  <span className="info-active-badge" style={{ background: m.color }}>
                    보는 중 ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 검색창 */}
        <div className="search-container">
          <input
            id="search-box"
            type="text"
            className="search-box"
            placeholder={searchPlaceholders[mainTab]}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </section>

      {/* ── Main Content ── */}
      <main className="main-content">
        {mainTab === "all" ? (
          <AllView searchTerm={debounced} />
        ) : mainTab === "genera" ? (
          <>
            <div className="layout-3-cols">
              <CloudLevelSection level="high" title="고층운 (High Clouds)"
                subtitle="얼음 결정으로 이루어진 높은 구름" altitude="5-13 km"
                altitudeDetail="극지방: 3-8km | 온대: 5-13km | 열대: 6-18km"
                icon="☁️" activeFilter={activeFilter} searchTerm={debounced} />
            </div>
            <div className="layout-3-cols">
              <CloudLevelSection level="mid" title="중층운 (Middle Clouds)"
                subtitle="물방울과 얼음 결정이 혼재된 중간 고도의 구름" altitude="2-7 km"
                altitudeDetail="극지방: 2-4km | 온대: 2-7km | 열대: 2-8km"
                icon="⛅" activeFilter={activeFilter} searchTerm={debounced} />
            </div>
            <div className="layout-4-cols">
              <CloudLevelSection level="low" title="저층운 (Low Clouds)"
                subtitle="주로 물방울로 이루어진 낮은 고도의 구름 (적운, 적란운 포함)"
                altitude="0-2 km" altitudeDetail="지표면 근처부터 2km 이하 고도 (적운/적란운은 수직 발달)"
                icon="🌤️" activeFilter={activeFilter} searchTerm={debounced} />
            </div>
          </>
        ) : (
          <SubTabContent cat={mainTab as SubCat} searchTerm={debounced} />
        )}
      </main>

      {/* Footer */}
      <footer className="atlas-footer">
        <div className="footer-content">
          <div className="footer-links">
            <Link href="/">홈</Link>
            <Link href="/#ai">AI 식별</Link>
            <Link href="/atlas">구름 도감</Link>
            <Link href="/#about">소개</Link>
          </div>
          <p>&copy; 2026 하늘결 프로젝트. All rights reserved.</p>
          <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", opacity: 0.8 }}>
            부경대학교 지구환경시스템과학부 환경대기과학전공
          </p>
        </div>
      </footer>
    </>
  );
}
