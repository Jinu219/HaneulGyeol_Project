"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={scrolled ? "scrolled" : ""}>
      <div className="logo">하늘결</div>
      <ul className="nav-links">
        <li><a href="#home">홈</a></li>
        <li><a href="#ai">AI 식별</a></li>
        <li><a href="#atlas">구름 도감</a></li>
        <li><a href="#about">소개</a></li>
      </ul>
    </nav>
  );
}
