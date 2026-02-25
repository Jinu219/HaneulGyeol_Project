// src/app/atlas/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FilterBar from "@/components/atlas/FilterBar";
import CloudLevelSection from "@/components/atlas/CloudLevelSection";
import "./atlas.css";

export default function AtlasPage() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debounced, setDebounced] = useState<string>("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchTerm), 200);
    return () => clearTimeout(t);
  }, [searchTerm]);

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

      {/* Filter */}
      <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Classification Info */}
      <section className="classification-info">
        <div className="info-grid">

          {/* Genera — 링크 없음 (현재 페이지) */}
          <div className="info-card info-card--static">
            <div className="count">10</div>
            <h3>구름 속 (Genera)</h3>
            <p>기본적인 구름의 형태와 고도에 따라 분류되는 10가지 주요 구름 종류</p>
          </div>

          {/* Species → taxonomy#species */}
          <Link href="/atlas/taxonomy#species" className="info-card info-card--link">
            <div className="count">15</div>
            <h3>구름 종 (Species)</h3>
            <p>구름의 형태와 구조적 특징에 따른 세부 분류</p>
            <span className="info-card-cta">전체 목록 보기 →</span>
          </Link>

          {/* Varieties → taxonomy#varieties */}
          <Link href="/atlas/taxonomy#varieties" className="info-card info-card--link">
            <div className="count">9</div>
            <h3>변종 (Varieties)</h3>
            <p>투명도와 배열 패턴에 따른 추가 분류</p>
            <span className="info-card-cta">전체 목록 보기 →</span>
          </Link>

          {/* Supplementary → taxonomy#supplementary */}
          <Link href="/atlas/taxonomy#supplementary" className="info-card info-card--link">
            <div className="count">15</div>
            <h3>부속 구름 등</h3>
            <p>보조 특징, 부속 구름 및 특수 구름 형태</p>
            <span className="info-card-cta">전체 목록 보기 →</span>
          </Link>

        </div>

        {/* Search Box */}
        <div className="search-container">
          <input
            id="search-box"
            type="text"
            className="search-box"
            placeholder="구름 이름으로 검색... (예: 적운, Cumulus, Cu)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        <div className="layout-3-cols">
          <CloudLevelSection
            level="high"
            title="고층운 (High Clouds)"
            subtitle="얼음 결정으로 이루어진 높은 구름"
            altitude="5-13 km"
            altitudeDetail="극지방: 3-8km | 온대: 5-13km | 열대: 6-18km"
            icon="☁️"
            activeFilter={activeFilter}
            searchTerm={debounced}
          />
        </div>
        <div className="layout-3-cols">
          <CloudLevelSection
            level="mid"
            title="중층운 (Middle Clouds)"
            subtitle="물방울과 얼음 결정이 혼재된 중간 고도의 구름"
            altitude="2-7 km"
            altitudeDetail="극지방: 2-4km | 온대: 2-7km | 열대: 2-8km"
            icon="⛅"
            activeFilter={activeFilter}
            searchTerm={debounced}
          />
        </div>
        <div className="layout-4-cols">
          <CloudLevelSection
            level="low"
            title="저층운 (Low Clouds)"
            subtitle="주로 물방울로 이루어진 낮은 고도의 구름 (적운, 적란운 포함)"
            altitude="0-2 km"
            altitudeDetail="지표면 근처부터 2km 이하 고도 (적운/적란운은 수직 발달)"
            icon="🌤️"
            activeFilter={activeFilter}
            searchTerm={debounced}
          />
        </div>
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
