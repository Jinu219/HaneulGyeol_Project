"use client";

// src/app/atlas/[cloudId]/page.tsx

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { cloudDetailData, type CloudDetailItem } from "./cloudData";
import "./cloud-detail.css";
import { useParams } from "next/navigation";
import MasonryGallery from "@/components/atlas/MasonryGallery";

// ── 서브아이템 아코디언 카드 ──────────────────────────────────
function SubItemCard({
  item,
  colorClass,
  codeClass,
}: {
  item: CloudDetailItem;
  colorClass: string;
  codeClass: string;
}) {
  const [open, setOpen] = useState(false);
  const hasImages = item.images.length > 0;

  return (
    <div className={`sub-card ${colorClass}`}>
      {/* 헤더 — 항상 표시 */}
      <button
        className="sub-card-header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="sub-card-title">
          <span className="sub-card-ko">{item.name_ko}</span>
          <span className="sub-card-en">{item.name_en}</span>
        </div>
        <div className="sub-card-right">
          {item.code && (
            <span className={`sub-card-code ${codeClass}`}>{item.code}</span>
          )}
          <span className={`sub-card-chevron${open ? " open" : ""}`}>›</span>
        </div>
      </button>

      {/* 펼쳐지는 콘텐츠 */}
      {open && (
        <div className="sub-card-body">
          {/* 갤러리 */}
          {hasImages && (
            <div className="sub-card-gallery">
              <MasonryGallery
                images={item.images}
                colDesktop={3}
                colTablet={2}
                colMobile={1}
                emptyMessage={`${item.name_ko} 사진을 추가하세요`}
              />
            </div>
          )}

          {/* 생성 원리 */}
          <div className="sub-card-section">
            <span className="sub-card-label">생성 원리</span>
            <p className="sub-card-text">
              {item.formation || "여기에 생성 원리를 작성하세요..."}
            </p>
          </div>

          {/* 설명 */}
          <div className="sub-card-section">
            <span className="sub-card-label">설명</span>
            <p className="sub-card-text">
              {item.description || "여기에 설명을 작성하세요..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────
export default function CloudDetailPage() {
  const params  = useParams();
  const cloudId = (params?.cloudId as string) || "";
  const cloud   = cloudDetailData[cloudId.toLowerCase()];

  if (!cloud) {
    return (
      <>
        <nav className="atlas-nav">
          <Link href="/" className="nav-logo">하늘결</Link>
          <div className="nav-links"><Link href="/atlas">구름 도감</Link></div>
        </nav>
        <div className="not-found">
          <h1>구름을 찾을 수 없습니다</h1>
          <p>요청하신 구름({cloudId})이 존재하지 않습니다.</p>
          <Link href="/atlas" className="back-btn">← 구름 도감으로 돌아가기</Link>
        </div>
      </>
    );
  }

  return (
    <>
      {/* ── 네비게이션 ── */}
      <nav className="atlas-nav">
        <Link href="/" className="nav-logo">하늘결</Link>
        <div className="nav-links"><Link href="/atlas">구름 도감</Link></div>
      </nav>

      {/* ── Hero ── */}
      <section className="cloud-hero">
        {cloud.image ? (
          <div className="cloud-hero-image-wrap">
            <Image
              src={cloud.image}
              alt={`${cloud.name_ko} 대표 사진`}
              fill
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center 55%" }}
              priority
            />
          </div>
        ) : (
          <div className={`cloud-hero-placeholder ${cloud.level}`} />
        )}
        {cloud.imageCredit && (
          <span className="image-credit">📷 {cloud.imageCredit}</span>
        )}
        <p className="breadcrumb">
          <Link href="/atlas">구름 도감</Link> / <span>{cloud.level_ko}</span>
        </p>
        <div className="cloud-symbol-large">{cloud.symbol}</div>
        <h1>{cloud.name_ko}</h1>
        <p className="cloud-name-en">{cloud.name_en}</p>
        <div className="cloud-badges">
          <span className={`level-badge ${cloud.level}`}>{cloud.level_ko}</span>
          <span className="comp-badge">{cloud.composition}</span>
        </div>
      </section>

      {/* ── 본문 ── */}
      <main className="cloud-detail-content">

        {/* ① 전체 갤러리 */}
        {cloud.images.length > 0 && (
          <section className="detail-section">
            <h2 className="section-title">
              사진 갤러리
              <span className="count-badge">{cloud.images.length}장</span>
            </h2>
            <MasonryGallery
              images={cloud.images}
              colDesktop={3}
              colTablet={2}
              colMobile={1}
            />
          </section>
        )}

        {/* ② 정의 */}
        <section className="detail-section">
          <h2 className="section-title">정의 (Definition)</h2>
          <div className="definition-box">
            <p className="editable-content">
              {cloud.definition || "여기에 구름의 정의를 작성하세요..."}
            </p>
          </div>
        </section>

        {/* ③ 생성 원리 */}
        <section className="detail-section">
          <h2 className="section-title">생성 원리 (Formation)</h2>
          <div className="formation-box">
            <p className="editable-content">
              {cloud.formation || "여기에 구름의 생성 원리를 작성하세요..."}
            </p>
          </div>
        </section>

        {/* ④ 종 — 아코디언 */}
        {cloud.species.length > 0 && (
          <section className="detail-section">
            <h2 className="section-title species-title">
              종 (Species)
              <span className="count-badge">{cloud.species.length}개</span>
            </h2>
            <div className="sub-cards-list">
              {cloud.species.map((item, idx) => (
                <SubItemCard
                  key={idx}
                  item={item}
                  colorClass="species-card"
                  codeClass="species-code"
                />
              ))}
            </div>
          </section>
        )}

        {/* ⑤ 변종 — 아코디언 */}
        {cloud.varieties.length > 0 && (
          <section className="detail-section">
            <h2 className="section-title variety-title">
              변종 (Varieties)
              <span className="count-badge">{cloud.varieties.length}개</span>
            </h2>
            <div className="sub-cards-list">
              {cloud.varieties.map((item, idx) => (
                <SubItemCard
                  key={idx}
                  item={item}
                  colorClass="variety-card"
                  codeClass="variety-code"
                />
              ))}
            </div>
          </section>
        )}

        {/* ⑥ 부속구름 — 아코디언 */}
        {cloud.supplementary.length > 0 && (
          <section className="detail-section">
            <h2 className="section-title supplementary-title">
              부속 구름 및 보조 특징
              <span className="count-badge">{cloud.supplementary.length}개</span>
            </h2>
            <div className="sub-cards-list">
              {cloud.supplementary.map((item, idx) => (
                <SubItemCard
                  key={idx}
                  item={item}
                  colorClass="supplementary-card"
                  codeClass="supplementary-code"
                />
              ))}
            </div>
          </section>
        )}

        {/* ⑦ 물리적 구성 */}
        <section className="detail-section">
          <h2 className="section-title">물리적 구성 (Physical Constitution)</h2>
          <div className="definition-box">
            <p className="editable-content">
              {cloud.physical || "여기에 물리적 구성을 작성하세요..."}
            </p>
          </div>
        </section>

        {/* ⑧ 관측 정보 */}
        <section className="detail-section">
          <h2 className="section-title">관측 정보 (Observation)</h2>
          <div className="definition-box">
            <p className="editable-content">
              {cloud.observation || "여기에 관측 팁을 작성하세요..."}
            </p>
          </div>
        </section>

        <div className="bottom-nav">
          <Link href="/atlas" className="back-btn">← 구름 도감으로 돌아가기</Link>
        </div>
      </main>

      <footer className="atlas-footer">
        <p>© 2025 하늘결 — 부경대학교 환경대기과학전공 WMO 국제구름사전 한국어 번역 프로젝트</p>
      </footer>
    </>
  );
}
