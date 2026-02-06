export default function Footer() {
  return (
    <footer>
      <div className="footer-content">
        <div className="footer-links">
          <a href="#home">홈</a>
          <a href="#ai">AI 식별</a>
          <a href="#atlas">구름 도감</a>
          <a href="#about">소개</a>
        </div>

        <p>&copy; 2026 하늘결 프로젝트. All rights reserved.</p>

        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", opacity: 0.8 }}>
          부경대학교 지구환경시스템과학부 환경대기과학전공
        </p>
      </div>
    </footer>
  );
}
