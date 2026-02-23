"use client";

// src/components/atlas/MasonryGallery.tsx
// CSS columns 방식 — 이미지마다 자연 비율이 달라 자동으로 다양한 높이 구성

import { useState } from "react";
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
  colDesktop = 3,
  colTablet = 2,
  colMobile = 1,
}: Props) {
  const [lightbox, setLightbox] = useState<CloudGalleryItem | null>(null);
  const [errored, setErrored] = useState<Set<number>>(new Set());

  const valid = images.filter((img) => img.src);

  if (valid.length === 0) {
    return (
      <div className="mgal-empty">
        <span>🖼️</span>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div
        className="mgal-grid"
        style={{
          "--col-desktop": colDesktop,
          "--col-tablet": colTablet,
          "--col-mobile": colMobile,
        } as React.CSSProperties}
      >
        {valid.map((img, idx) => (
          <div
            key={idx}
            className="mgal-item"
            onClick={() => !errored.has(idx) && setLightbox(img)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && !errored.has(idx) && setLightbox(img)}
            aria-label={`${img.alt} 크게 보기`}
          >
            {errored.has(idx) ? (
              <div className="mgal-fallback">
                <span>📷</span>
                <small>사진 준비 중</small>
              </div>
            ) : (
              /* 일반 img 태그 — 자연 높이(auto)로 렌더링되어 열마다 다른 높이 → 자연스러운 메이슨리 */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img.src}
                alt={img.alt}
                className="mgal-img"
                loading="lazy"
                onError={() => setErrored((prev) => new Set([...prev, idx]))}
              />
            )}

            {img.credit && !errored.has(idx) && (
              <span className="mgal-credit">{img.credit}</span>
            )}
            {!errored.has(idx) && (
              <div className="mgal-overlay" aria-hidden="true">🔍</div>
            )}
          </div>
        ))}
      </div>

      {/* 라이트박스 */}
      {lightbox && (
        <div
          className="mgal-lightbox"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="mgal-lb-close"
            onClick={() => setLightbox(null)}
            aria-label="닫기"
          >✕</button>
          <div className="mgal-lb-body" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox.src} alt={lightbox.alt} className="mgal-lb-img" />
            {lightbox.alt && <p className="mgal-lb-caption">{lightbox.alt}</p>}
          </div>
        </div>
      )}
    </>
  );
}
