import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AISection from "@/components/AISection";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <AISection />
      {/* Atlas, About, Footer 순서대로 추가 */}
    </>
  );
}
