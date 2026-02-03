import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import AISection from "../components/AISection";
import AtlasSection from "../components/AtlasSection";
import AboutSection from "../components/AboutSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <AISection />
      <AtlasSection />
      <AboutSection />
      <Footer />
    </>
  );
}
