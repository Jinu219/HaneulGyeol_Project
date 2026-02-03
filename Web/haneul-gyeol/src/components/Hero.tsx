export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="cloud-animation">
        <div className="cloud cloud1" />
        <div className="cloud cloud2" />
        <div className="cloud cloud3" />
      </div>

      <div className="hero-content">
        <h1>하늘결</h1>
        <p className="subtitle">구름을 읽는 시간</p>
        <a href="#ai" className="cta-button">지금 시작하기</a>
      </div>
    </section>
  );
}
