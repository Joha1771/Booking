import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useUniqueHotels,
  useTrendingDestinations,
} from "../../hooks/useQueries.js";
import HotelCard from "../ui/HotelCard.jsx";
import HotelCardSkeleton from "../ui/HotelCardSkeleton.jsx";

const ACTIVITY_TABS = [
  "Исторические экспедиции",
  "Искусство и музыка",
  "Гастрономия",
  "Шоппинг",
  "Фестивали и мероприятия",
  "Фотография",
  "Наследие & История",
];

const FALLBACK_UZ_CITIES = [
  {
    name: "Ташкент",
    variants: "1 408",
    image_url:
      "https://cf.bstatic.com/xdata/images/city/max1280x900/686023.jpg?k=315b82bac9991c71d6f14f8618e68a9b6d3f45b61b9ceb335523918d0e086dbf&o=",
  },
  {
    name: "Самарканд",
    variants: "864",
    image_url:
      "https://cf.bstatic.com/xdata/images/city/max1280x900/916707.jpg?k=92d3c6a6f59fe96b7044218defba0d9e1b9b376b424121dbb29db63a45c62d24&o=",
  },
  {
    name: "Бухара",
    variants: "570",
    image_url:
      "https://cf.bstatic.com/xdata/images/city/max1280x900/948982.jpg?k=df876b79aa087808adf33387dfdad56350813a328ca436dbad74fb9fa597bc16&o=",
  },
  {
    name: "Хива",
    variants: "154",
    image_url:
      "https://cf.bstatic.com/xdata/images/city/max1280x900/685491.jpg?k=c01e7a88b1b08c54bb3f282ec0ddc28e0ef82e8c3cb48a2b37baa0e91e9cac38&o=",
  },
  {
    name: "Фергана",
    variants: "43",
    image_url: "https://picsum.photos/seed/fergana/400/300",
  },
  {
    name: "Чимган",
    variants: "20",
    image_url: "https://picsum.photos/seed/chimgan/400/300",
  },
];

const EXPEDITION_CITIES = [
  {
    name: "Ташкент",
    dist: "В 7 км",
    image_url:
      "https://cf.bstatic.com/xdata/images/city/max1280x900/686023.jpg?k=315b82bac9991c71d6f14f8618e68a9b6d3f45b61b9ceb335523918d0e086dbf&o=",
  },
  {
    name: "Коканд",
    dist: "В 166 км",
    image_url: "https://picsum.photos/seed/kokand/400/300",
  },
  {
    name: "Фергана",
    dist: "В 237 км",
    image_url: "https://picsum.photos/seed/fergana2/400/300",
  },
  {
    name: "Самарканд",
    dist: "В 262 км",
    image_url:
      "https://cf.bstatic.com/xdata/images/city/max1280x900/916707.jpg?k=92d3c6a6f59fe96b7044218defba0d9e1b9b376b424121dbb29db63a45c62d24&o=",
  },
  {
    name: "Бухара",
    dist: "В 438 км",
    image_url:
      "https://cf.bstatic.com/xdata/images/city/max1280x900/948982.jpg?k=df876b79aa087808adf33387dfdad56350813a328ca436dbad74fb9fa597bc16&o=",
  },
  {
    name: "Хива",
    dist: "В 739 км",
    image_url:
      "https://cf.bstatic.com/xdata/images/city/max1280x900/685491.jpg?k=c01e7a88b1b08c54bb3f282ec0ddc28e0ef82e8c3cb48a2b37baa0e91e9cac38&o=",
  },
];

function CityCard({ city, onClick }) {
  return (
    <div onClick={onClick} style={{ cursor: "pointer" }}>
      <div
        style={{
          borderRadius: 8,
          overflow: "hidden",
          marginBottom: 8,
          paddingTop: "75%",
          position: "relative",
        }}
      >
        <img
          src={city.image_url || city.image}
          alt={city.name}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onError={(e) => {
            e.currentTarget.src =
              "https://picsum.photos/seed/" + city.name + "/400/300";
          }}
        />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{city.name}</div>
      {city.variants && (
        <div style={{ fontSize: 12, color: "var(--booking-text-light)" }}>
          {city.variants} вариантов размещения
        </div>
      )}
      {city.dist && (
        <div style={{ fontSize: 12, color: "var(--booking-text-light)" }}>
          {city.dist}
        </div>
      )}
    </div>
  );
}

export default function UzbekistanSection() {
  const [actTab, setActTab] = useState(0);
  const navigate = useNavigate();
  const { data: destinations, isLoading: destLoading } =
    useTrendingDestinations();
  const { data: uniqueHotels, isLoading: hotelsLoading } = useUniqueHotels(4);

  const uzCities = destinations
    ?.filter((d) => d.country === "Узбекистан")
    .map((d) => ({
      name: d.name,
      variants: d.variants?.toLocaleString("ru-RU"),
      image_url: d.image_url,
    }));

  const cities = uzCities?.length ? uzCities : FALLBACK_UZ_CITIES;

  const handleCityClick = (name) => {
    navigate(`/search?destination=${encodeURIComponent(name)}`);
  };

  return (
    <>
      {/* Uzbekistan cities */}
      <section
        style={{
          padding: "32px 0",
          borderTop: "1px solid var(--booking-border)",
        }}
      >
        <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
          <h2 className="section-heading">
            Узбекистан — откройте для себя эту страну
          </h2>
          <p className="section-subheading">
            В этих популярных местах вы точно найдёте что-то для себя.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 12,
            }}
          >
            {cities.map((city, i) => (
              <CityCard
                key={i}
                city={city}
                onClick={() => handleCityClick(city.name)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Plan your trip */}
      <section style={{ padding: "16px 0 32px" }}>
        <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
          <h2 className="section-heading">
            Спланируйте поездку легко и быстро
          </h2>
          <p className="section-subheading">
            Выберите вид отдыха и посмотрите лучшие места в Узбекистане
          </p>
          <div
            className="flex items-center"
            style={{ gap: 8, marginBottom: 20, flexWrap: "wrap" }}
          >
            {ACTIVITY_TABS.map((tab, i) => (
              <button
                key={i}
                className={`pill-tab ${actTab === i ? "active" : ""}`}
                onClick={() => setActTab(i)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {EXPEDITION_CITIES.map((city, i) => (
              <CityCard
                key={i}
                city={city}
                onClick={() => handleCityClick(city.name)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Unique accommodation */}
      <section style={{ padding: "16px 0 32px" }}>
        <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
          <h2 className="section-heading">Выберите уникальное жильё</h2>
          <p className="section-subheading">
            У нас есть всё: от замков и вилл до плавучих отелей и иглу
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {hotelsLoading
              ? [1, 2, 3, 4].map((i) => <HotelCardSkeleton key={i} />)
              : (uniqueHotels || []).map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
          </div>
        </div>
      </section>
    </>
  );
}
