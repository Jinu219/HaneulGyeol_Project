export default function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="about-content">
        <h2 className="section-title">프로젝트 소개</h2>

        <p className="about-text">
          하늘결 프로젝트는 구름에 관심 있는 모든 분들을 위한 공간입니다.
          <br />
          국제구름사전의 한글 자료 부족을 느끼고, 누구나 쉽게 구름을 배우고
          <br />
          이해할 수 있는 플랫폼을 만들고자 시작되었습니다.
        </p>

        <div className="about-author">
          <p>
            <strong>
              부경대학교 지구환경시스템과학부 환경대기과학전공 24학번 이진우
            </strong>
            <br />
            <br />
            "구름에 관심이 있는 사람들도 구름을 설명해주는 사이트가 있으면 얼마나
            좋을까?"
            <br />
            라는 사고에서 출발한 이 프로젝트는, 구름의 종, 변종, 부속 구름, 생성
            원리,
            <br />
            분류 기준 등을 체계적으로 정리하여 제공합니다.
            <br />
            <br />
            참고:{" "}
            <a
              href="https://cloudatlas.wmo.int/en/home.html"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--sky-deep)" }}
            >
              국제구름사전 (WMO)
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
