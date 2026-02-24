"use client";

// src/components/atlas/MasonryGallery.tsx
// CSS columns Pinterest 스타일 — 전체 너비, 자연 비율, 다양한 높이

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
  colDesktop = 10,
  colTablet = 3,
  colMobile = 2,
}: Props) {
  const [lightbox, setLightbox] = useState<CloudGalleryItem | null>(null);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});

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
          "--col-tablet":  colTablet,
          "--col-mobile":  colMobile,
        } as React.CSSProperties}
      >
        {valid.map((img, idx) => (
          <div
            key={idx}
            className="mgal-item"
            onClick={() => setLightbox(img)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setLightbox(img)}
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

      {lightbox && (
        <div
          className="mgal-lightbox"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <button className="mgal-lb-close" onClick={() => setLightbox(null)} aria-label="닫기">✕</button>
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
