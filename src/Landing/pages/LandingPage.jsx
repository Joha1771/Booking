import Header from "../../components/layout/Header.jsx";
import Footer from "../../components/layout/Footer.jsx";
import HeroSection from "../sections/HeroSection.jsx";
import PopularHomesSection from "../sections/PopularHomesSection.jsx";
import WeekendOffersSection from "../sections/WeekendOffersSection.jsx";
import GeniusSection from "../../components/sections/GeniusSection.jsx";
import PopularInUzbekistanSection from "../sections/PopularInUzbekistanSection.jsx";
import UzbekistanSection from "../sections/UzbekistanSection.jsx";
import PopularDestinationsSection from "../sections/PopularDestinationsSection.jsx";

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <Header />
      <HeroSection />

      <div style={{ background: "#fff", paddingTop: 0 }}>
        <PopularHomesSection />
        <PopularDestinationsSection />
        <UzbekistanSection />
        <WeekendOffersSection />
        <GeniusSection />
        <PopularInUzbekistanSection />
      </div>

      <Footer />
    </div>
  );
}
