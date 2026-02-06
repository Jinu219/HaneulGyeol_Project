// src/components/DynamicHero.tsx
"use client";

import { useState, useEffect } from "react";
import "./DynamicHero.css";

export default function DynamicHero() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [manualTime, setManualTime] = useState<number | null>(null);
  const [showTimeControl, setShowTimeControl] = useState(false);

  // 실시간 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(timer);
  }, []);

  // 현재 시간 (수동 조절 시 manualTime 사용)
  const displayHour = manualTime !== null 
    ? manualTime 
    : currentTime.getHours() + currentTime.getMinutes() / 60;

  // 시간대별 배경 스타일 계산
  const getSkyStyle = (hour: number) => {
    // 밤 (22:00-04:00)
    if (hour >= 22 || hour < 4) {
      return {
        background: "linear-gradient(180deg, #0a1128 0%, #1e3a5f 50%, #2c5f8d 100%)",
        stars: true,
        moon: true,
      };
    }
    // 새벽/일출 (04:00-06:30) - 더 길게 조정
    else if (hour >= 4 && hour < 6.5) {
      const progress = (hour - 4) / 2.5; // 0 ~ 1 (2시간 → 2.5시간)
      return {
        background: `linear-gradient(180deg, 
          ${interpolateColor("#0a1128", "#1e3a8a", progress * 0.3)} 0%,
          ${interpolateColor("#1e3a5f", "#ff6b9d", progress * 0.6)} 20%, 
          ${interpolateColor("#2c5f8d", "#ffa500", progress)} 50%, 
          ${interpolateColor("#4a7ba7", "#ffb347", progress)} 70%,
          ${interpolateColor("#87ceeb", "#e3f2fd", progress)} 100%)`,
        stars: progress < 0.4,
        sun: progress > 0.2,
        sunrise: true,
      };
    }
    // 아침 (06:30-10:00)
    else if (hour >= 6.5 && hour < 10) {
      return {
        background: "linear-gradient(180deg, #87ceeb 0%, #b3e5fc 50%, #e3f2fd 100%)",
        clouds: true,
        sun: true,
      };
    }
    // 낮 (10:00-16:00)
    else if (hour >= 10 && hour < 16) {
      return {
        background: "linear-gradient(180deg, #4fc3f7 0%, #81d4fa 50%, #b3e5fc 100%)",
        clouds: true,
        sun: true,
      };
    }
    // 황혼/일몰 (16:00-18:30) - 더 길게 조정
    else if (hour >= 16 && hour < 18.5) {
      const progress = (hour - 16) / 2.5; // 0 ~ 1 (2시간 → 2.5시간)
      return {
        background: `linear-gradient(180deg, 
          ${interpolateColor("#4fc3f7", "#ff6b9d", progress)} 0%, 
          ${interpolateColor("#81d4fa", "#ff8c42", progress)} 30%,
          ${interpolateColor("#b3e5fc", "#ffd700", progress)} 60%,
          ${interpolateColor("#e3f2fd", "#ff69b4", progress)} 100%)`,
        sunset: true,
        sun: progress < 0.8,
      };
    }
    // 저녁 (18:30-22:00)
    else if (hour >= 18.5 && hour < 22) {
      const progress = (hour - 18.5) / 3.5; // 0 ~ 1
      return {
        background: `linear-gradient(180deg, 
          ${interpolateColor("#ff6b9d", "#0a1128", progress)} 0%, 
          ${interpolateColor("#9c4dcc", "#1e3a5f", progress)} 50%, 
          ${interpolateColor("#5e35b1", "#2c5f8d", progress)} 100%)`,
        stars: progress > 0.4,
        moon: progress > 0.5,
      };
    }

    return {
      background: "linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 100%)",
      clouds: true,
    };
  };

  const skyStyle = getSkyStyle(displayHour);

  // 태양/달 위치 계산 - 위→아래로 이동
  const getCelestialPosition = (hour: number) => {
    // 태양: 새벽(04:00)에 위에서 시작 → 낮(10:00)에 중앙 → 저녁(18:00)에 아래로
    if (hour >= 4 && hour <= 18.5) {
      const progress = (hour - 4) / 14.5; // 0 ~ 1 (14.5시간)
      return {
        left: "50%", // 중앙 고정
        top: `${progress * 100}%`, // 위(0%) → 아래(100%)
        transform: "translate(-50%, -50%)", // 중앙 정렬
      };
    }
    // 달: 저녁(18:30)에 위에서 시작 → 새벽(04:00)에 아래로
    else {
      const adjustedHour = hour >= 18.5 ? hour - 18.5 : hour + 5.5;
      const progress = adjustedHour / 10; // 0 ~ 1 (10시간)
      return {
        left: "50%",
        top: `${20 + progress * 60}%`, // 위(20%) → 아래(80%)
        transform: "translate(-50%, -50%)",
      };
    }
  };

  const celestialPos = getCelestialPosition(displayHour);

  return (
    <section className="dynamic-hero" style={{ background: skyStyle.background }}>
      {/* 시간 컨트롤 UI */}
      <div className="time-controls">
        <div className="current-time">
          {manualTime !== null ? (
            <span>⏰ {formatHour(manualTime)}</span>
          ) : (
            <span>🕐 {currentTime.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</span>
          )}
        </div>
        <button
          className="toggle-control-btn"
          onClick={() => setShowTimeControl(!showTimeControl)}
        >
          🎨 시간 조절
        </button>
      </div>

      {/* 시간 슬라이더 */}
      {showTimeControl && (
        <div className="time-slider-panel">
          <div className="slider-header">
            <h3>하늘 시간 설정</h3>
            <button
              className="reset-btn"
              onClick={() => setManualTime(null)}
            >
              ↺ 실시간으로
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="24"
            step="0.1"
            value={manualTime ?? displayHour}
            onChange={(e) => setManualTime(parseFloat(e.target.value))}
            className="time-slider"
          />
          <div className="time-labels">
            <span>자정</span>
            <span>새벽</span>
            <span>아침</span>
            <span>낮</span>
            <span>저녁</span>
            <span>밤</span>
          </div>
        </div>
      )}

      {/* 별 */}
      {skyStyle.stars && (
        <div className="stars-container">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: Math.random() * 0.8 + 0.2,
              }}
            />
          ))}
        </div>
      )}


      {/* 구름 애니메이션 */}
      {skyStyle.clouds && (
        <div className="clouds-container">
          <div className="cloud cloud1" />
          <div className="cloud cloud2" />
          <div className="cloud cloud3" />
        </div>
      )}

      {/* Hero 콘텐츠 */}
      <div className="hero-content">
        <h1>하늘결</h1>
        <p className="subtitle">구름을 읽는 시간</p>
        <a href="#ai" className="cta-button">
          지금 시작하기
        </a>
      </div>
    </section>
  );
}

// 색상 보간 함수
function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  
  if (!c1 || !c2) return color1;
  
  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);
  
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function formatHour(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}
