// src/app/atlas/[cloudId]/page.tsx
"use client";

import { use } from "react";
import Link from "next/link";
import { cloudDetailData } from "./cloudData";
import "./cloud-detail.css";

type CloudDetailPageProps = {
  params: Promise<{ cloudId: string }>;
};

export default function CloudDetailPage({ params }: CloudDetailPageProps) {
  const { cloudId } = use(params);
  const cloud = cloudDetailData[cloudId.toLowerCase()];

  if (!cloud) {
    return (
      <div className="not-found">
        <h1>구름을 찾을 수 없습니다</h1>
        <Link href="/atlas">돌아가기</Link>
      </div>
    );
  }

  return (
    <>
      {/* Navbar */}
      <nav className="atlas-nav">
        <Link href="/" className="logo">
          하늘결
        </Link>
        <ul className="nav-links">
          <li>
            <Link href="/">홈</Link>
          </li>
          <li>
            <Link href="/#ai">AI 식별</Link>
          </li>
          <li>
            <Link href="/atlas" className="active">
              구름 도감
            </Link>
          </li>
          <li>
            <Link href="/#about">소개</Link>
          </li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="cloud-hero">
        <div className="cloud-hero-content">
          <div className="breadcrumb">
            <Link href="/atlas">구름 도감</Link> / <span>{cloud.level_ko}</span>
          </div>
          <div className="cloud-symbol-large">{cloud.symbol}</div>
          <h1>{cloud.name_ko}</h1>
          <p className="cloud-name-en">{cloud.name_en}</p>
          <div className="cloud-badges">
            <span className={`level-badge ${cloud.level}`}>{cloud.level_ko}</span>
            <span className="comp-badge">{cloud.composition}</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="cloud-detail-content">
        {/* 정의 섹션 */}
        <section className="detail-section">
          <h2 className="section-title">정의 (Definition)</h2>
          <div className="definition-box">
            <p className="editable-content">{cloud.definition || "여기에 구름의 정의를 작성하세요..."}</p>
          </div>
        </section>

        {/* 종 (Species) */}
        {cloud.species && cloud.species.length > 0 && (
          <section className="detail-section">
            <h2 className="section-title">
              종 (Species)
              <span className="count-badge">{cloud.species.length}개</span>
            </h2>
            <div className="cards-grid">
              {cloud.species.map((item, idx) => (
                <div key={idx} className="info-card species-card">
                  <div className="card-header">
                    <h3>{item.name_ko || `종 ${idx + 1}`}</h3>
                    <span className="card-code">{item.code || ""}</span>
                  </div>
                  <p className="card-name-en">{item.name_en || ""}</p>
                  <p className="editable-content card-description">
                    {item.description || "여기에 설명을 작성하세요..."}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 변종 (Varieties) */}
        {cloud.varieties && cloud.varieties.length > 0 && (
          <section className="detail-section">
            <h2 className="section-title">
              변종 (Varieties)
              <span className="count-badge">{cloud.varieties.length}개</span>
            </h2>
            <div className="cards-grid">
              {cloud.varieties.map((item, idx) => (
                <div key={idx} className="info-card variety-card">
                  <div className="card-header">
                    <h3>{item.name_ko || `변종 ${idx + 1}`}</h3>
                    <span className="card-code">{item.code || ""}</span>
                  </div>
                  <p className="card-name-en">{item.name_en || ""}</p>
                  <p className="editable-content card-description">
                    {item.description || "여기에 설명을 작성하세요..."}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 부속 구름 및 보조 특징 */}
        {cloud.supplementary && cloud.supplementary.length > 0 && (
          <section className="detail-section">
            <h2 className="section-title">
              부속 구름 및 보조 특징
              <span className="count-badge">{cloud.supplementary.length}개</span>
            </h2>
            <div className="cards-grid">
              {cloud.supplementary.map((item, idx) => (
                <div key={idx} className="info-card supplementary-card">
                  <div className="card-header">
                    <h3>{item.name_ko || `특징 ${idx + 1}`}</h3>
                    <span className="card-code">{item.code || ""}</span>
                  </div>
                  <p className="card-name-en">{item.name_en || ""}</p>
                  <p className="editable-content card-description">
                    {item.description || "여기에 설명을 작성하세요..."}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 물리적 구성 */}
        <section className="detail-section">
          <h2 className="section-title">물리적 구성 (Physical Constitution)</h2>
          <div className="definition-box">
            <p className="editable-content">
              {cloud.physical || "여기에 물리적 구성을 작성하세요..."}
            </p>
          </div>
        </section>

        {/* 관측 팁 */}
        <section className="detail-section">
          <h2 className="section-title">관측 정보 (Observation)</h2>
          <div className="definition-box">
            <p className="editable-content">
              {cloud.observation || "여기에 관측 팁을 작성하세요..."}
            </p>
          </div>
        </section>

        {/* 네비게이션 */}
        <div className="bottom-nav">
          <Link href="/atlas" className="back-btn">
            ← 구름 도감으로 돌아가기
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="atlas-footer">
        <div className="footer-content">
          <p>&copy; 2026 하늘결 프로젝트. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
