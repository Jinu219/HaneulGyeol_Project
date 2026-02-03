"use client";

import { useRef, useState } from "react";

type MockResult = {
  name: string;
  confidence: number;
  description: string;
  height: string;
  precipitation: string;
};

export default function AISection() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [topResult, setTopResult] = useState<MockResult | null>(null);
  const [altResult, setAltResult] = useState<MockResult | null>(null);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setIsLoading(true);
    setTopResult(null);
    setAltResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPreviewUrl(url);

      // mock 분석 (원본 HTML 로직을 React로 옮김)
      setTimeout(() => {
        const mockResults: MockResult[] = [
          {
            name: "적운 (Cumulus)",
            confidence: 92,
            description:
              "맑은 날씨에 자주 나타나는 뭉게구름입니다. 대기가 불안정할 때 형성되며, 낮 동안 태양열로 인한 상승기류로 발달합니다.",
            height: "600-2000m",
            precipitation: "없음 ~ 약한 소나기",
          },
          {
            name: "층적운 (Stratocumulus)",
            confidence: 7,
            description: "낮은 고도에서 덩어리진 형태로 나타나는 구름입니다.",
            height: "600-2000m",
            precipitation: "거의 없음",
          },
        ];

        setTopResult(mockResults[0]);
        setAltResult(mockResults[1]);
        setIsLoading(false);
      }, 1200);
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="ai-section" id="ai">
      <h2 className="section-title">AI 구름 식별</h2>
      <p className="section-subtitle">
        구름 사진을 올려주세요. AI가 어떤 구름인지 알려드립니다.
      </p>

      <div className="ai-container">
        <div
          className="upload-area"
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
          style={
            isDragging
              ? {
                  borderColor: "var(--sky-deep)",
                  background: "var(--sky-light)",
                }
              : undefined
          }
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
          <h3 style={{ marginBottom: "1rem", color: "var(--sky-deep)" }}>
            분석 결과
          </h3>

          {isLoading && (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="loading" />
              <p style={{ marginTop: "1rem" }}>AI가 구름을 분석중입니다...</p>
            </div>
          )}

          {!isLoading && previewUrl && topResult && (
            <>
              <div style={{ marginBottom: "2rem" }}>
                {/* next/image로 바꾸는 건 나중에 해도 됨 */}
                <img
                  src={previewUrl}
                  alt="업로드 이미지"
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    marginBottom: "1.5rem",
                  }}
                />
              </div>

              <div
                style={{
                  background: "var(--sky-light)",
                  padding: "1.5rem",
                  borderRadius: "10px",
                  marginBottom: "1rem",
                }}
              >
                <h4
                  style={{
                    color: "var(--sky-deep)",
                    marginBottom: "1rem",
                    fontSize: "1.3rem",
                  }}
                >
                  {topResult.name}
                </h4>

                <div
                  style={{
                    background: "var(--cloud-white)",
                    padding: "0.5rem 1rem",
                    borderRadius: "20px",
                    display: "inline-block",
                    marginBottom: "1rem",
                  }}
                >
                  <strong>확신도:</strong> {topResult.confidence}%
                </div>

                <p style={{ lineHeight: 1.8, marginBottom: "1rem" }}>
                  {topResult.description}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginTop: "1rem",
                  }}
                >
                  <div>
                    <strong style={{ color: "var(--sky-deep)" }}>고도:</strong>
                    <br />
                    {topResult.height}
                  </div>
                  <div>
                    <strong style={{ color: "var(--sky-deep)" }}>강수:</strong>
                    <br />
                    {topResult.precipitation}
                  </div>
                </div>
              </div>

              {altResult && (
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--text-light)",
                    padding: "1rem",
                    background: "var(--cloud-gray)",
                    borderRadius: "10px",
                  }}
                >
                  <strong>다른 가능성:</strong> {altResult.name} (
                  {altResult.confidence}%)
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
