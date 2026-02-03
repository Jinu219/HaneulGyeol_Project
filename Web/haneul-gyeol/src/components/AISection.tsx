"use client";

import { useRef, useState } from "react";

type Prediction = {
  code: string;
  name_ko: string;
  confidence: number; // 0~1
  description: string;
};

type ApiResult = {
  predictions: Prediction[];
  confidence_level: "high" | "medium" | "low";
  confidence_text: string;
  tips: string[];
  meta?: {
    img_size?: number;
    device?: string;
    arch?: string;
    run_name?: string;
  };
};

type ApiResponse = {
  success: boolean;
  result?: ApiResult;
  error?: string;
};

export default function AISection() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ 추후 배포 시: NEXT_PUBLIC_CLOUD_API 같은 환경변수로 빼면 좋음
  const API_URL = process.env.NEXT_PUBLIC_CLOUD_API_URL ?? "http://127.0.0.1:8000/predict";

  const openFilePicker = () => fileInputRef.current?.click();

  const isImageFile = (file: File) => file.type.startsWith("image/");

  const setPreviewFromFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const analyze = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(API_URL, {
        method: "POST",
        body: form,
      });

      const data = (await res.json()) as ApiResponse;

      if (!res.ok || !data.success || !data.result) {
        throw new Error(data.error || `API error (status: ${res.status})`);
      }

      setResult(data.result);
    } catch (e: any) {
      setError(e?.message ?? "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFile = (file: File) => {
    if (!isImageFile(file)) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }
    setPreviewFromFile(file);
    analyze(file);
  };

  const top = result?.predictions?.[0];
  const rest = result?.predictions?.slice(1) ?? [];

  return (
    <section className="ai-section" id="ai">
      <h2 className="section-title">AI 구름 식별</h2>
      <p className="section-subtitle">
        구름 사진을 올려주세요. AI가 운형 후보(Top-3)와 설명을 제공합니다.
      </p>

      <div className="ai-container">
        {/* 업로드 영역 */}
        <div
          className={`upload-area ${isDragging ? "dragging" : ""}`}
          onClick={openFilePicker}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
        >
          <p className="upload-text">구름 사진을 드래그하거나 클릭하세요</p>
          <p className="upload-hint">JPG, PNG 파일 지원</p>

          <input
            ref={fileInputRef}
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>

        {/* 결과 영역 */}
        <div className={`result-area ${previewUrl ? "active" : ""}`}>
          <h3 className="result-title">분석 결과</h3>

          {!previewUrl && (
            <div className="result-empty">
              <p>왼쪽에 이미지를 업로드하면 결과가 표시됩니다.</p>
            </div>
          )}

          {previewUrl && (
            <div className="result-preview">
              <img
                src={previewUrl}
                alt="업로드 이미지"
                className="preview-img"
              />
            </div>
          )}

          {isLoading && (
            <div className="result-loading">
              <div className="loading" />
              <p>AI가 구름을 분석중입니다...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="result-error">
              <strong>오류</strong>
              <p>{error}</p>
              <p className="error-hint">
                API 서버(8000)가 켜져 있는지 확인해 주세요.
              </p>
            </div>
          )}

          {result && !isLoading && top && (
            <>
              {/* 확신도 배지 + 메타 */}
              <div className="confidence-row">
                <span className={`confidence-badge ${result.confidence_level}`}>
                  {result.confidence_text}
                </span>
                {result.meta?.arch && (
                  <span className="meta-text">
                    {result.meta.arch}
                    {result.meta.device ? ` / ${result.meta.device}` : ""}
                    {result.meta.img_size ? ` / img ${result.meta.img_size}` : ""}
                  </span>
                )}
              </div>

              {/* Top-1 카드 */}
              <div className="top-card">
                <div className="top-card-head">
                  <h4 className="top-card-title">
                    {top.code} · {top.name_ko}
                  </h4>
                  <div className="top-card-score">
                    {(top.confidence * 100).toFixed(1)}%
                  </div>
                </div>

                <p className="top-card-desc">{top.description}</p>
              </div>

              {/* 나머지 후보 */}
              {rest.length > 0 && (
                <div className="alt-box">
                  <strong>다른 가능성</strong>
                  <ul>
                    {rest.map((p) => (
                      <li key={p.code}>
                        <span className="alt-name">
                          {p.code} · {p.name_ko}
                        </span>
                        <span className="alt-score">
                          {(p.confidence * 100).toFixed(1)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 확신 낮으면 촬영 팁 */}
              {result.tips?.length > 0 && (
                <div className="tips-box">
                  <strong>정확도를 높이는 촬영 팁</strong>
                  <ul>
                    {result.tips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
