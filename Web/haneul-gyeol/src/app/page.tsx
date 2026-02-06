import Navbar from "../components/Navbar";
import DynamicHero from "../components/DynamicHero";
import AISection from "../components/AISection";
import AtlasSection from "../components/AtlasSection";
import AboutSection from "../components/AboutSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <DynamicHero />
      <AISection />
      <AtlasSection />
      <AboutSection />
      <Footer />
    </>
  );
}
