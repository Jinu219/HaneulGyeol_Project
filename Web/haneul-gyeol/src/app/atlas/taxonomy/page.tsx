// src/app/atlas/taxonomy/page.tsx
// 종(Species) / 변종(Varieties) / 부속구름(SFAC) 전체 목록 페이지

"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { cloudDetailData } from "@/app/atlas/[cloudId]/cloudData";
import "./taxonomy.css";

// ── 타입 ──────────────────────────────────────────────────────
type Category = "species" | "varieties" | "supplementary";

interface TaxoItem {
  nameKo: string;
  nameEn: string;
  code:   string;
  /** 이 항목을 보유한 구름 속 목록 */
  inClouds: { id: string; symbol: string; nameKo: string; level: string }[];
}

// 레벨 색상
const LEVEL_COLOR: Record<string, { color: string; bg: string }> = {
  high: { color: "#4a90e2", bg: "#E3F2FD" },
  mid:  { color: "#0277bd", bg: "#B3E5FC" },
  low:  { color: "#00838f", bg: "#B2EBF2" },
};

// 카테고리 메타
const CAT_META: Record<Category, {
  id: string; ko: string; en: string;
  desc: string; color: string; bg: string; border: string;
}> = {
  species: {
    id: "species", ko: "종", en: "Species",
    desc: "구름의 형태와 구조적 특징에 따른 세부 분류",
    color: "#e65100", bg: "#fff3e0", border: "#ffcc80",
  },
  varieties: {
    id: "varieties", ko: "변종", en: "Varieties",
    desc: "투명도와 배열 패턴에 따른 추가 분류",
    color: "#f57f17", bg: "#fffde7", border: "#fff176",
  },
  supplementary: {
    id: "supplementary", ko: "부속 구름 및 보조 특징", en: "SFAC",
    desc: "보조 특징, 부속 구름 및 특수 구름 형태",
    color: "#2e7d32", bg: "#e8f5e9", border: "#a5d6a7",
  },
};

// ── 유니크 아이템 수집 ────────────────────────────────────────
function collectUnique(category: Category): TaxoItem[] {
  const map = new Map<string, TaxoItem>();

  Object.entries(cloudDetailData).forEach(([id, cloud]) => {
    (cloud[category] ?? []).forEach((item) => {
      if (!map.has(item.name_en)) {
        map.set(item.name_en, {
          nameKo: item.name_ko,
          nameEn: item.name_en,
          code:   item.code,
          inClouds: [],
        });
      }
      map.get(item.name_en)!.inClouds.push({
        id,
        symbol:  cloud.symbol,
        nameKo:  cloud.name_ko,
        level:   cloud.level,
      });
    });
  });

  // 출현 구름 수 기준 내림차순 정렬
  return Array.from(map.values()).sort(
    (a, b) => b.inClouds.length - a.inClouds.length
  );
}

// ── 섹션 컴포넌트 ─────────────────────────────────────────────
function TaxoSection({ category }: { category: Category }) {
  const meta  = CAT_META[category];
  const items = collectUnique(category);

  return (
    <section className="taxo-section" id={meta.id}>
      {/* 섹션 헤더 */}
      <div className="taxo-section-header"
        style={{ borderColor: meta.border, background: meta.bg }}>
        <div className="taxo-section-title-row">
          <h2 className="taxo-section-title" style={{ color: meta.color }}>
            {meta.ko}
            <span className="taxo-section-en">({meta.en})</span>
          </h2>
          <span className="taxo-count-badge"
            style={{ color: meta.color, background: meta.border + "55" }}>
            {items.length}종
          </span>
        </div>
        <p className="taxo-section-desc">{meta.desc}</p>
      </div>

      {/* 카드 그리드 */}
      <div className="taxo-grid">
        {items.map((item) => (
          <Link
            key={item.nameEn}
            href={`/atlas/sub/${category}/${item.nameEn}`}
            className="taxo-card"
            style={{ "--cat-color": meta.color, "--cat-bg": meta.bg } as React.CSSProperties}
          >
            {/* 코드 + 이름 */}
            <div className="taxo-card-head">
              <span className="taxo-card-code"
                style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}>
                {item.code}
              </span>
              <div className="taxo-card-names">
                <span className="taxo-card-ko">{item.nameKo}</span>
                <span className="taxo-card-en">{item.nameEn}</span>
              </div>
            </div>

            {/* 출현 구름 칩 */}
            <div className="taxo-card-clouds">
              {item.inClouds.map((c) => {
                const lv = LEVEL_COLOR[c.level];
                return (
                  <span key={c.id} className="taxo-cloud-chip"
                    style={{ color: lv.color, background: lv.bg, border: `1px solid ${lv.color}33` }}>
                    {c.symbol}
                  </span>
                );
              })}
            </div>

            {/* 호버 힌트 */}
            <span className="taxo-card-hint">자세히 보기 →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────
export default function TaxonomyPage() {
  // 해시 앵커 스크롤 처리
  const didScroll = useRef(false);
  useEffect(() => {
    if (didScroll.current) return;
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const el = document.getElementById(hash);
      if (el) { el.scrollIntoView({ behavior: "smooth" }); }
    }
    didScroll.current = true;
  }, []);

  const categories: Category[] = ["species", "varieties", "supplementary"];

  return (
    <>
      {/* ── 네비게이션 ── */}
      <nav className="atlas-nav">
        <Link href="/" className="nav-logo">하늘결</Link>
        <div className="nav-links">
          <Link href="/">홈</Link>
          <Link href="/#ai">AI 식별</Link>
          <Link href="/atlas" className="active">구름 도감</Link>
          <Link href="/#about">소개</Link>
        </div>
      </nav>

      {/* ── 헤더 ── */}
      <section className="taxo-hero">
        <div className="taxo-hero-bg" />
        <div className="taxo-hero-content">
          <p className="taxo-breadcrumb">
            <Link href="/atlas">구름 도감</Link> / 분류 목록
          </p>
          <h1 className="taxo-hero-title">종 · 변종 · 부속 구름</h1>
          <p className="taxo-hero-sub">
            WMO 국제구름사전 기준 — 종(Species) · 변종(Varieties) · 부속 구름 및 보조 특징(SFAC)
          </p>

          {/* 빠른 이동 */}
          <div className="taxo-jump-btns">
            {categories.map((cat) => {
              const m = CAT_META[cat];
              return (
                <a key={cat} href={`#${m.id}`} className="taxo-jump-btn"
                  style={{ color: m.color, background: m.bg, border: `1.5px solid ${m.border}` }}>
                  {m.ko}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 본문 ── */}
      <main className="taxo-content">
        {categories.map((cat) => (
          <TaxoSection key={cat} category={cat} />
        ))}

        <div className="bottom-nav" style={{ width: "var(--content-width, 82%)", margin: "0 auto" }}>
          <Link href="/atlas" className="back-btn">← 구름 도감으로 돌아가기</Link>
        </div>
      </main>

      <footer className="atlas-footer">
        <p>© 2026 하늘결 (HaneulGyeol) — Cloud Atlas</p>
      </footer>
    </>
  );
}
