"use client";

// src/app/atlas/sub/[category]/[subName]/page.tsx

import Link from "next/link";
import { useParams } from "next/navigation";
import { cloudDetailData } from "@/app/atlas/[cloudId]/cloudData";
import type { CloudGalleryItem } from "@/app/atlas/[cloudId]/cloudData";
import MasonryGallery from "@/components/atlas/MasonryGallery";
import RelatedCloudsPanel from "@/components/atlas/RelatedCloudsPanel";
import "@/components/atlas/RelatedCloudsPanel.css";
import "./sub-detail.css";

type Category = "species" | "varieties" | "supplementary";

interface Occurrence {
  cloudId:     string;
  symbol:      string;
  cloudNameKo: string;
  cloudNameEn: string;
  cloudLevel:  string;
  itemCode:    string;
  fullLabel:   string;
  images:      CloudGalleryItem[];
}

const CATEGORY_LABEL: Record<Category, { ko: string; color: string; bg: string }> = {
  species:       { ko: "종 (Species)",          color: "#e65100", bg: "#fff3e0" },
  varieties:     { ko: "변종 (Varieties)",       color: "#f57f17", bg: "#fffde7" },
  supplementary: { ko: "부속 구름 및 보조 특징", color: "#2e7d32", bg: "#e8f5e9" },
};

const LEVEL_META: Record<string, { ko: string; emoji: string; color: string; bg: string }> = {
  high: { ko: "상층운", emoji: "☁️",  color: "#4a90e2", bg: "#E3F2FD" },
  mid:  { ko: "중층운", emoji: "⛅",  color: "#0277bd", bg: "#B3E5FC" },
  low:  { ko: "저층운", emoji: "🌤️", color: "#00838f", bg: "#B2EBF2" },
};

function findOccurrences(category: Category, subName: string): Occurrence[] {
  const result: Occurrence[] = [];
  Object.entries(cloudDetailData).forEach(([cloudId, cloud]) => {
    const found = (cloud[category] ?? []).find((i) => i.name_en === subName);
    if (!found) return;
    const shortCode = `${cloud.symbol} ${found.code}`;
    result.push({
      cloudId,
      symbol:      cloud.symbol,
      cloudNameKo: cloud.name_ko,
      cloudNameEn: cloud.name_en,
      cloudLevel:  cloud.level,
      itemCode:    found.code,
      fullLabel:   `${cloud.name_en} ${subName} (${shortCode})`,
      images:      found.images,
    });
  });
  return result;
}

export default function SubDetailPage() {
  const params   = useParams();
  const category = (params?.category as Category) || "species";
  const subName  = (params?.subName  as string)   || "";

  const occurrences = findOccurrences(category, subName);

  if (occurrences.length === 0) {
    return (
      <>
        <nav className="atlas-nav">
          <Link href="/" className="nav-logo">하늘결</Link>
          <div className="nav-links">
            <Link href="/">홈</Link>
            <Link href="/#ai">AI 식별</Link>
            <Link href="/atlas">구름 도감</Link>
            <Link href="/#about">소개</Link>
          </div>
        </nav>
        <div className="not-found">
          <h1>항목을 찾을 수 없습니다</h1>
          <p>요청하신 항목({subName})이 존재하지 않습니다.</p>
          <Link href="/atlas" className="back-btn">← 구름 도감으로 돌아가기</Link>
        </div>
      </>
    );
  }

  const firstCloud = cloudDetailData[occurrences[0].cloudId];
  const firstItem  = firstCloud[category].find((i) => i.name_en === subName)!;
  const catMeta    = CATEGORY_LABEL[category];

  // 대표 레벨: 첫 번째 발생 구름 기준
  const heroLevel  = firstCloud.level;

  const allImages: CloudGalleryItem[] = occurrences.flatMap((o) => o.images);

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

      {/* ── Hero ── cloud-detail과 동일한 하단 중앙 정렬 구조 ── */}
      <section className="sub-hero">
        <div className={`sub-hero-bg level-${heroLevel}`} />

        {/* 카테고리 태그 */}
        <span className="sub-category-tag"
          style={{ color: catMeta.color, background: catMeta.bg }}>
          {catMeta.ko}
        </span>

        {/* 한글 이름 */}
        <h1 className="sub-hero-name-ko">{firstItem.name_ko}</h1>

        {/* 영문 이름 */}
        <p className="sub-hero-name-en">{subName}</p>

        {/* 브레드크럼 */}
        <p className="sub-breadcrumb">
          <Link href="/atlas">구름 도감</Link>
          {" / "}
          <Link href={`/atlas/taxonomy#${category}`}>{catMeta.ko}</Link>
          {" / "}
          <span>{firstItem.name_ko}</span>
        </p>
      </section>

      {/* ── 본문 ── */}
      <main className="sub-detail-content">

        {/* ① 사진 갤러리 */}
        {allImages.length > 0 && (
          <section className="detail-section gallery-full">
            <h2 className="section-title">
              사진 갤러리
              <span className="count-badge">{allImages.length}장</span>
            </h2>
            <MasonryGallery images={allImages} colDesktop={4} colTablet={3} colMobile={2} />
          </section>
        )}

        {/* ② 출현 구름 */}
        <section className="detail-section">
          <h2 className="section-title">
            출현 구름 (Cloud Genera)
            <span className="count-badge">{occurrences.length}종</span>
          </h2>
          <div className="occurrence-grid">
            {occurrences.map((occ) => {
              const lvl = LEVEL_META[occ.cloudLevel];
              return (
                <Link key={occ.cloudId} href={`/atlas/${occ.cloudId}`} className="occurrence-card">
                  <span className="occ-level-badge"
                    style={{ color: lvl.color, background: lvl.bg }}>
                    {lvl.emoji} {lvl.ko}
                  </span>
                  <div className="occ-cloud-name">
                    <span className="occ-symbol">{occ.symbol}</span>
                    <span className="occ-name-ko">{occ.cloudNameKo}</span>
                  </div>
                  <p className="occ-full-label">{occ.fullLabel}</p>
                  <span className="occ-link-hint">구름 상세 보기 →</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ③ 정의 */}
        <section className="detail-section">
          <h2 className="section-title">정의 (Definition)</h2>
          <div className="definition-box">
            <p className="editable-content">
              {firstItem.description || "여기에 정의를 작성하세요..."}
            </p>
          </div>
        </section>

        {/* ④ 생성 원리 */}
        <section className="detail-section">
          <h2 className="section-title">생성 원리 (Formation)</h2>
          <div className="formation-box">
            <p className="editable-content">
              {firstItem.formation || "여기에 생성 원리를 작성하세요..."}
            </p>
          </div>
        </section>

        {/* ⑤ 물리적 구성 */}
        <section className="detail-section">
          <h2 className="section-title">물리적 구성 (Physical Constitution)</h2>
          <div className="definition-box">
            <p className="editable-content">
              여기에 물리적 구성을 작성하세요...
            </p>
          </div>
        </section>

        {/* ⑥ 구름 탐색 패널 — 4열 공유 컴포넌트 */}
        <RelatedCloudsPanel
          currentSub={{ category, nameEn: subName }}
        />

        <div className="bottom-nav">
          <Link href="/atlas" className="back-btn">← 구름 도감으로 돌아가기</Link>
        </div>
      </main>

      <footer className="atlas-footer">
        <p>© 2026 하늘결 (HaneulGyeol) — Cloud Atlas</p>
      </footer>
    </>
  );
}
