import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import PopularDestinationsSection from "@/components/sections/PopularDestinationsSection";
import AttractionsSection from "@/components/sections/AttractionsSection";
import WeekendOffersSection from "@/components/sections/WeekendOffersSection";
import GeniusSection from "@/components/sections/GeniusSection";
import UzbekistanSection from "@/components/sections/UzbekistanSection";
import PopularInUzbekistanSection from "@/components/sections/PopularInUzbekistanSection";
import { getWeekendHotels, getUniqueHotels } from "@/lib/api/hotels";
import { getTrendingDestinations } from "@/lib/api/destinations";
import { getAttractions } from "@/lib/api/attractions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let weekendHotels = [];
  let uniqueHotels = [];
  let destinations = [];
  let attractions = [];

  try {
    [weekendHotels, uniqueHotels, destinations, attractions] =
      await Promise.all([
        getWeekendHotels(20),
        getUniqueHotels(4),
        getTrendingDestinations(),
        getAttractions(undefined, 8),
      ]);
  } catch (e) {
    console.error("HomePage data fetch error:", e);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <Header />
      <main>
        <HeroSection />
        <WeekendOffersSection hotels={weekendHotels} />
        <PopularDestinationsSection destinations={destinations} />
        <GeniusSection />
        <AttractionsSection attractions={attractions} />
        <UzbekistanSection
          destinations={destinations}
          uniqueHotels={uniqueHotels}
        />
        <PopularInUzbekistanSection />
      </main>
      <Footer />
    </div>
  );
}
