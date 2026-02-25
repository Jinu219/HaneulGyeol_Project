"use client";

// src/app/atlas/[cloudId]/page.tsx

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { cloudDetailData, type CloudDetailItem } from "./cloudData";
import "./cloud-detail.css";
import { useParams } from "next/navigation";
import MasonryGallery from "@/components/atlas/MasonryGallery";
import RelatedCloudsPanel from "@/components/atlas/RelatedCloudsPanel";
import "@/components/atlas/RelatedCloudsPanel.css";

// ── 서브아이템 아코디언 카드 ──────────────────────────────────
function SubItemCard({
  item, colorClass, codeClass, category,
}: {
  item: CloudDetailItem;
  colorClass: string;
  codeClass: string;
  category: "species" | "varieties" | "supplementary";
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`sub-card ${colorClass}`}>
      <button className="sub-card-header" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <div className="sub-card-title">
          <span className="sub-card-ko">{item.name_ko}</span>
          <span className="sub-card-en">{item.name_en}</span>
        </div>
        <div className="sub-card-right">
          {item.code && <span className={`sub-card-code ${codeClass}`}>{item.code}</span>}
          <span className={`sub-card-chevron${open ? " open" : ""}`}>›</span>
        </div>
      </button>

      {open && (
        <div className="sub-card-body">
          <div className="sub-card-section">
            <span className="sub-card-label">생성 원리</span>
            <p className="sub-card-text sub-card-text--clamp">
              {item.formation || "여기에 생성 원리를 작성하세요..."}
            </p>
          </div>
          <div className="sub-card-section">
            <span className="sub-card-label">설명</span>
            <p className="sub-card-text sub-card-text--clamp">
              {item.description || "여기에 설명을 작성하세요..."}
            </p>
          </div>
          <div className="sub-card-footer">
            <Link href={`/atlas/sub/${category}/${item.name_en}`} className="sub-card-detail-btn">
              자세히 보기 →
            </Link>
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
          <div className="nav-links">
            <Link href="/">홈</Link>
            <Link href="/#ai">AI 식별</Link>
            <Link href="/atlas">구름 도감</Link>
            <Link href="/#about">소개</Link>
          </div>
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
        <div className="nav-links">
          <Link href="/">홈</Link>
          <Link href="/#ai">AI 식별</Link>
          <Link href="/atlas" className="active">구름 도감</Link>
          <Link href="/#about">소개</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="cloud-hero">
        {cloud.image ? (
          <div className="cloud-hero-image-wrap">
            <Image src={cloud.image} alt={`${cloud.name_ko} 대표 사진`} fill sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center 55%" }} priority />
          </div>
        ) : (
          <div className={`cloud-hero-placeholder ${cloud.level}`} />
        )}
        {cloud.imageCredit && <span className="image-credit">📷 {cloud.imageCredit}</span>}
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

        {/* ① 갤러리 */}
        {cloud.images.length > 0 && (
          <section className="detail-section gallery-full">
            <h2 className="section-title">
              사진 갤러리 <span className="count-badge">{cloud.images.length}장</span>
            </h2>
            <MasonryGallery images={cloud.images} colDesktop={4} colTablet={3} colMobile={2} />
          </section>
        )}

        {/* ② 정의 */}
        <section className="detail-section">
          <h2 className="section-title">정의 (Definition)</h2>
          <div className="definition-box">
            <p className="editable-content">{cloud.definition || "여기에 구름의 정의를 작성하세요..."}</p>
          </div>
        </section>

        {/* ③ 생성 원리 */}
        <section className="detail-section">
          <h2 className="section-title">생성 원리 (Formation)</h2>
          <div className="formation-box">
            <p className="editable-content">{cloud.formation || "여기에 구름의 생성 원리를 작성하세요..."}</p>
          </div>
        </section>

        {/* ④ 종 · 변종 · 부속구름 */}
        <section className="detail-section taxonomy-section">
          <h2 className="section-title">종 · 변종 · 부속구름</h2>
          {cloud.species.length === 0 && cloud.varieties.length === 0 && cloud.supplementary.length === 0 ? (
            <div className="taxonomy-empty"><p>이 구름에는 <b>종/변종/부속구름</b> 정보가 없습니다.</p></div>
          ) : (
            <div className="taxonomy-grid">
              <div className="taxonomy-col">
                <div className="subsection-title-row">
                  <h3 className="subsection-title species-title">종 (Species)</h3>
                  <span className="count-badge">{cloud.species.length}개</span>
                </div>
                {cloud.species.length > 0 ? (
                  <div className="sub-cards-list">
                    {cloud.species.map((item, idx) => (
                      <SubItemCard key={`sp-${idx}`} item={item}
                        colorClass="species-card" codeClass="species-code" category="species" />
                    ))}
                  </div>
                ) : <div className="taxonomy-note">등록된 종(Species) 정보가 없습니다.</div>}
              </div>

              <div className="taxonomy-col">
                <div className="subsection-title-row">
                  <h3 className="subsection-title variety-title">변종 (Varieties)</h3>
                  <span className="count-badge">{cloud.varieties.length}개</span>
                </div>
                {cloud.varieties.length > 0 ? (
                  <div className="sub-cards-list">
                    {cloud.varieties.map((item, idx) => (
                      <SubItemCard key={`va-${idx}`} item={item}
                        colorClass="variety-card" codeClass="variety-code" category="varieties" />
                    ))}
                  </div>
                ) : <div className="taxonomy-note">등록된 변종(Varieties) 정보가 없습니다.</div>}
              </div>

              <div className="taxonomy-col">
                <div className="subsection-title-row">
                  <h3 className="subsection-title supplementary-title">부속 구름 및 보조 특징</h3>
                  <span className="count-badge">{cloud.supplementary.length}개</span>
                </div>
                {cloud.supplementary.length > 0 ? (
                  <div className="sub-cards-list">
                    {cloud.supplementary.map((item, idx) => (
                      <SubItemCard key={`su-${idx}`} item={item}
                        colorClass="supplementary-card" codeClass="supplementary-code" category="supplementary" />
                    ))}
                  </div>
                ) : <div className="taxonomy-note">등록된 부속 구름/보조 특징 정보가 없습니다.</div>}
              </div>
            </div>
          )}
        </section>

        {/* ⑤ 물리적 구성 */}
        <section className="detail-section">
          <h2 className="section-title">물리적 구성 (Physical Constitution)</h2>
          <div className="definition-box">
            <p className="editable-content">{cloud.physical || "여기에 물리적 구성을 작성하세요..."}</p>
          </div>
        </section>

        {/* ⑥ 관측 정보 */}
        <section className="detail-section">
          <h2 className="section-title">관측 정보 (Observation)</h2>
          <div className="definition-box">
            <p className="editable-content">{cloud.observation || "여기에 관측 팁을 작성하세요..."}</p>
          </div>
        </section>

        {/* ⑦ 구름 탐색 패널 — 4열 공유 컴포넌트 */}
        <RelatedCloudsPanel currentCloudId={cloudId.toLowerCase()} />

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
