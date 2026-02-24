"use client";

// src/components/atlas/MasonryGallery.tsx

import { useState, useEffect, useCallback } from "react";
import type { CloudGalleryItem } from "@/app/atlas/[cloudId]/cloudData";
import "./MasonryGallery.css";

type Props = {
  images: CloudGalleryItem[];
  emptyMessage?: string;
  colDesktop?: number;
  colTablet?: number;
  colMobile?: number;
};

export default function MasonryGallery({
  images,
  emptyMessage = "사진을 추가하면 여기에 표시됩니다",
  colDesktop = 4,
  colTablet = 3,
  colMobile = 2,
}: Props) {
  // lightbox에 현재 인덱스를 저장
  const [lbIndex, setLbIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});

  const valid = images.filter((img) => img.src);
  const total = valid.length;

  // 이전 / 다음 이동
  const goPrev = useCallback(() => {
    setLbIndex((i) => (i === null ? null : (i - 1 + total) % total));
  }, [total]);

  const goNext = useCallback(() => {
    setLbIndex((i) => (i === null ? null : (i + 1) % total));
  }, [total]);

  const close = useCallback(() => setLbIndex(null), []);

  // 키보드 이벤트
  useEffect(() => {
    if (lbIndex === null) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  { e.preventDefault(); goPrev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
      if (e.key === "Escape")     { close(); }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lbIndex, goPrev, goNext, close]);

  if (valid.length === 0) {
    return (
      <div className="mgal-empty">
        <span>🖼️</span>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const current = lbIndex !== null ? valid[lbIndex] : null;

  return (
    <>
      {/* 그리드 */}
      <div
        className="mgal-grid"
        style={{
          "--col-desktop": colDesktop,
          "--col-tablet":  colTablet,
          "--col-mobile":  colMobile,
        } as React.CSSProperties}
      >
        {valid.map((img, idx) => (
          <div
            key={idx}
            className="mgal-item"
            onClick={() => setLbIndex(idx)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setLbIndex(idx)}
            aria-label={`${img.alt} 크게 보기`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt}
              className={`mgal-img${loaded[idx] ? " mgal-img--loaded" : ""}`}
              onLoad={() => setLoaded((p) => ({ ...p, [idx]: true }))}
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.style.display = "none";
                const fb = el.nextElementSibling as HTMLElement | null;
                if (fb) fb.style.display = "flex";
              }}
            />
            <div className="mgal-fallback" style={{ display: "none" }}>
              <span>📷</span><small>사진 준비 중</small>
            </div>
            {img.credit && <span className="mgal-credit">{img.credit}</span>}
            <div className="mgal-overlay" aria-hidden="true">🔍</div>
          </div>
        ))}
      </div>

      {/* 라이트박스 */}
      {lbIndex !== null && current && (
        <div
          className="mgal-lightbox"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          {/* 닫기 */}
          <button className="mgal-lb-close" onClick={close} aria-label="닫기">✕</button>

          {/* 카운터 */}
          <div className="mgal-lb-counter">{lbIndex + 1} / {total}</div>

          {/* 이전 버튼 */}
          <button
            className="mgal-lb-nav mgal-lb-prev"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="이전 사진"
          >
            ‹
          </button>

          {/* 사진 */}
          <div className="mgal-lb-body" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={lbIndex}             /* key 변경 → 트랜지션 재실행 */
              src={current.src}
              alt={current.alt}
              className="mgal-lb-img mgal-lb-img--anim"
            />
            {current.alt && <p className="mgal-lb-caption">{current.alt}</p>}
            {/* 키보드 힌트 */}
            <p className="mgal-lb-hint">← → 방향키로 이동 &nbsp;·&nbsp; ESC로 닫기</p>
          </div>

          {/* 다음 버튼 */}
          <button
            className="mgal-lb-nav mgal-lb-next"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="다음 사진"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
