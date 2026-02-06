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

    // 스크롤 이동 (전체가 아닌 경우에만)
    if (filterId !== "all") {
      const targetSection = document.getElementById(`level-${filterId}`);
      if (targetSection) {
        // 네비게이션 높이 + 필터바 높이를 고려한 오프셋
        const navHeight = 80; // 네비게이션 높이
        const filterHeight = 100; // 필터바 높이
        const offset = navHeight + filterHeight;
        
        const elementPosition = targetSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    } else {
      // "전체" 버튼 클릭 시 페이지 상단으로 스크롤
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
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
