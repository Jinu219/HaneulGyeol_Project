// src/components/atlas/FilterBar.tsx
"use client";

type FilterBarProps = {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
};

export default function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  const filters = [
    { id: "all", label: "전체" },
    { id: "high", label: "고층운 (5-13km)" },
    { id: "mid", label: "중층운 (2-7km)" },
    { id: "low", label: "저층운 (0-2km)" },
  ];

  const handleFilterClick = (filterId: string) => {
    onFilterChange(filterId);

    // 렌더 반영 후 스크롤 (2번 RAF가 더 안정적)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (filterId === "all") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        const targetSection = document.getElementById(`level-${filterId}`);
        if (!targetSection) return;

        // ✅ 실제 높이 측정
        const nav = document.querySelector(".atlas-nav") as HTMLElement | null;
        const filter = document.querySelector(".filter-section") as HTMLElement | null;

        const navH = nav?.getBoundingClientRect().height ?? 0;
        const filterH = filter?.getBoundingClientRect().height ?? 0;

        const offset = navH + filterH + 16; // 여백 16px

        const top =
          targetSection.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({ top, behavior: "smooth" });
      });
    });
  };


  const handleSearchClick = () => {
    const searchBox = document.getElementById("search-box");
    if (searchBox) {
      searchBox.scrollIntoView({ behavior: "smooth", block: "center" });
      searchBox.focus();
    }
  };

  return (
    <div className="filter-section">
      <div className="filter-container">
        <span className="filter-label">고도별 분류:</span>
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`filter-btn ${activeFilter === filter.id ? "active" : ""}`}
            onClick={() => handleFilterClick(filter.id)}
          >
            {filter.label}
          </button>
        ))}
        
        {/* 검색 아이콘 버튼 */}
        <button
          className="filter-btn search-btn"
          onClick={handleSearchClick}
          title="검색창으로 이동"
        >
          🔍 검색
        </button>
      </div>
    </div>
  );
}
