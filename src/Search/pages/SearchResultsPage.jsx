// SearchResultsPage - Supabase-backed results
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/layout/Header.jsx";
import Footer from "../../components/layout/Footer.jsx";
import { useSearchHotels } from "../../hooks/useQueries.js";
import {
  Heart,
  MapPin,
  ChevronRight,
  ChevronDown,
  X,
  Star,
  Info,
} from "lucide-react";

const CITY_ALIASES = {
  ташкент: "Ташкент",
  tashkent: "Ташкент",
  дубай: "Дубай",
  dubai: "Дубай",
  самарканд: "Самарканд",
  samarkand: "Самарканд",
  бухара: "Бухара",
  bukhara: "Бухара",
  хива: "Хива",
  khiva: "Хива",
  стамбул: "Стамбул",
  istanbul: "Стамбул",
  коканд: "Коканд",
  kokand: "Коканд",
  фергана: "Фергана",
  fergana: "Фергана",
  нукус: "Нукус",
  nukus: "Нукус",
  ургенч: "Ургенч",
  urgench: "Ургенч",
  chimgan: "Чимган",
  чимган: "Чимган",
};

const ACTIVITIES = [
  {
    name: "Explore Amirsoy, Chimgan & Charvak – A Full-Day Mountain...",
    rating: 4.5,
    reviews: 28,
    priceOld: null,
    price: "UZS 546 539,25",
    freeCancel: true,
    image: "https://picsum.photos/seed/act1/300/180",
  },
  {
    name: "Tashkent City Highlights Guided Walking Tour",
    rating: 4.8,
    reviews: 6,
    priceOld: "UZS 303 633",
    price: "UZS 191 289",
    freeCancel: true,
    image: "https://picsum.photos/seed/act2/300/180",
  },
  {
    name: "Private Transfer from/to Tashkent Airport",
    rating: 3.6,
    reviews: 17,
    priceOld: null,
    price: "UZS 242 906,31",
    freeCancel: true,
    image: "https://picsum.photos/seed/act3/300/180",
  },
];

const FILTERS_LEFT = [
  { label: "Ваш бюджет (за ночь)", type: "range", min: 0, max: 5000000 },
  {
    label: "Популярные фильтры",
    type: "check",
    items: [
      { name: "Завтрак включён", count: 88 },
      {
        name: "Очень хорошо: 8+",
        count: 93,
        sub: "На основании отзывов гостей",
      },
      { name: "Отели", count: 88 },
      { name: "4 звезды", count: 29 },
      { name: "Бассейн", count: 44 },
      { name: "Бесплатный Wi-Fi", count: 150 },
      { name: "Апартаменты/квартиры", count: 45 },
      { name: "Без предоплаты", count: 151 },
    ],
  },

  {
    label: "Питание",
    type: "check",
    items: [
      { name: "Завтрак включён", count: 88 },
      { name: "Включён завтрак и ужин", count: 1 },
      { name: "С собственной кухней", count: 62 },
    ],
  },
  {
    label: "Удобства",
    type: "check",
    items: [
      { name: "Бассейн", count: 44 },
      { name: "Парковка", count: 135 },
      { name: "Спа и оздоровительный центр", count: 31 },
      { name: "Гидромассажная ванна/джакузи", count: 20 },
      { name: "Бесплатный Wi-Fi", count: 150 },
    ],
  },
  {
    label: "Удобства в номере",
    type: "check",
    items: [
      { name: "Собственная ванная комната", count: 116 },
      { name: "Кондиционер", count: 157 },
      { name: "Кухня/мини-кухня", count: 62 },
      { name: "Балкон", count: 56 },
      { name: "Вид на море", count: 1 },
    ],
  },
  {
    label: "Тип размещения",
    type: "check",
    items: [
      { name: "Отели", count: 88 },
      { name: "Апартаменты/квартиры", count: 45 },
      { name: "Дома для отпуска", count: 3 },
      { name: "Общежития", count: 1 },
      { name: "Хостелы", count: 14 },
      { name: "Гостевые дома", count: 9 },
      { name: "Дома и апартаменты целиком", count: 54 },
      { name: "Варианты, подходящие для семей", count: 51 },
    ],
  },
  {
    label: "Спальни и ванные комнаты",
    type: "counter",
    items: [{ name: "Спальни" }, { name: "Ванные комнаты" }],
  },
  {
    label: "Оценка по отзывам",
    type: "check",
    items: [
      { name: "Превосходно: 9+", count: 53 },
      { name: "Очень хорошо: 8+", count: 93 },
      { name: "Хорошо: 7+", count: 116 },
      { name: "Достаточно хорошо: 6+", count: 125 },
    ],
  },
  {
    label: "Оценка объекта",
    type: "check",
    items: [
      { name: "1 звезда", count: 1 },
      { name: "2 звезды", count: 1 },
      { name: "3 звезды", count: 25 },
      { name: "4 звезды", count: 29 },
      { name: "5 звезд", count: 6 },
    ],
  },
  {
    label: "__CITY__: расстояние от центра",
    type: "check",
    items: [
      { name: "Меньше 1 км", count: 20 },
      { name: "Меньше 3 км", count: 52 },
      { name: "Меньше 5 км", count: 97 },
    ],
  },
  {
    label: "Правила бронирования",
    type: "check",
    items: [
      { name: "Без предоплаты", count: 151 },
      { name: "Бесплатная отмена", count: 68 },
      { name: "Бронирование без кредитной карты", count: 98 },
    ],
  },
  {
    label: "Бренды",
    type: "check",
    items: [
      { name: "Ramada by Wyndham", count: 2 },
      { name: "Mercure", count: 2 },
      { name: "Wyndham Hotels & Resorts", count: 1 },
      { name: "Hilton Hotels & Resorts", count: 1 },
      { name: "JW Marriott Hotels & Resorts", count: 1 },
      { name: "Hampton by Hilton", count: 1 },
    ],
  },
];

const SORT_OPTIONS = [
  { value: "recommended", label: "Мы рекомендуем для семей" },
  { value: "priceAsc", label: "Сначала самые дешёвые" },
  { value: "priceDesc", label: "Сначала самые дорогие" },
  { value: "ratingDesc", label: "По оценке гостей" },
  { value: "distanceAsc", label: "По расстоянию до центра" },
];

const BRAND_MATCHERS = [
  "Ramada by Wyndham",
  "Mercure",
  "Wyndham Hotels & Resorts",
  "Hilton Hotels & Resorts",
  "JW Marriott Hotels & Resorts",
  "Hampton by Hilton",
];

function parsePrice(price) {
  if (typeof price === "number") return price;
  return Number(String(price || "").replace(/[^\d]/g, "")) || 0;
}

function parseDistance(distance) {
  const match = String(distance || "")
    .replace(",", ".")
    .match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

function formatSearchPrice(value) {
  const numeric = Number(value || 0);
  return `UZS ${Math.round(numeric).toLocaleString("ru-RU")}`;
}

function adaptBackendHotel(hotel, fallbackCity) {
  const roomType = hotel.type || "Вариант размещения";
  const city = hotel.city || fallbackCity || "Ташкент";
  const addressLine = hotel.address ? `Адрес: ${hotel.address}` : null;
  const descriptionLine =
    hotel.description || "Подробности доступны на странице объекта.";
  const roomDesc = [addressLine, descriptionLine].filter(Boolean).join("\n");
  const hasDiscount =
    Number(hotel.priceOld || 0) > 0 &&
    Number(hotel.priceOld || 0) > Number(hotel.price || 0);

  return {
    id: hotel.id,
    name: hotel.name,
    stars: hotel.stars || 0,
    genius: !!hotel.genius,
    badge: hotel.badge || null,
    city,
    dist: hotel.distance || "Расположение уточняйте на карте",
    seasonal: hasDiscount,
    image: hotel.image,
    rating: hotel.rating || 0,
    ratingLabel: hotel.ratingLabel || "Оценка по отзывам",
    reviews: hotel.reviews || 0,
    roomName: `${roomType} — ${city}`,
    roomDesc,
    freeChild: false,
    breakfast: !!hotel.breakfast,
    freeCancel: !!hotel.freeCancel,
    noPrep: !!hotel.noPrep,
    nights: hotel.nights || 1,
    adults: 2,
    children: 0,
    priceOld: hasDiscount ? formatSearchPrice(hotel.priceOld) : null,
    price: formatSearchPrice(hotel.price),
    tax: null,
    taxIncl: true,
    recommended: hotel.rating >= 9 || hotel.breakfast || hotel.freeCancel,
  };
}

function inferPropertyType(hotel) {
  const text =
    `${hotel.name} ${hotel.roomName} ${hotel.roomDesc}`.toLowerCase();

  if (
    text.includes("апартамент") ||
    text.includes("apartment") ||
    text.includes("кухня")
  ) {
    return "apartment";
  }

  if (text.includes("boutique") || text.includes("guesthouse")) {
    return "guesthouse";
  }

  if (text.includes("hostel")) {
    return "hostel";
  }

  return "hotel";
}

function inferBrand(hotelName) {
  return (
    BRAND_MATCHERS.find((brand) =>
      hotelName.toLowerCase().includes(brand.toLowerCase()),
    ) || null
  );
}

function enrichHotel(hotel) {
  const propertyType = inferPropertyType(hotel);
  const text =
    `${hotel.name} ${hotel.roomName} ${hotel.roomDesc}`.toLowerCase();

  return {
    ...hotel,
    priceValue: parsePrice(hotel.price),
    distanceKm: parseDistance(hotel.dist),
    propertyType,
    brand: inferBrand(hotel.name),
    bedrooms:
      text.includes("2 спальн") || text.includes("2 bedroom")
        ? 2
        : propertyType === "apartment"
          ? 1
          : 0,
    bathrooms: text.includes("2 ванные") ? 2 : 1,
    amenities: {
      breakfastIncluded: !!hotel.breakfast,
      breakfastDinner:
        !!hotel.breakfast && (hotel.stars >= 4 || text.includes("делюкс")),
      review8: hotel.rating >= 8,
      review9: hotel.rating >= 9,
      review7: hotel.rating >= 7,
      review6: hotel.rating >= 6,
      pool:
        hotel.stars >= 4 ||
        /grand|plaza|palace|resort|marriott|ramada/i.test(hotel.name),
      parking: hotel.stars >= 3 || propertyType === "apartment",
      spa:
        hotel.stars >= 4 ||
        /spa|grand|resort|marriott|palace/i.test(hotel.name),
      jacuzzi: hotel.stars >= 5 || /suite|делюкс|grand|resort/i.test(text),
      wifi: true,
      privateBathroom: true,
      airConditioning: hotel.stars >= 3 || !text.includes("медресе"),
      kitchen: propertyType === "apartment" || text.includes("кухня"),
      balcony:
        text.includes("балкон") || text.includes("вид") || hotel.stars >= 4,
      seaView:
        text.includes("море") ||
        text.includes("босфор") ||
        text.includes("bosfor"),
      noCreditCard: !!hotel.noPrep,
      familyFriendly: !!hotel.freeChild || !!hotel.recommended,
    },
  };
}

function matchesNamedFilter(hotel, filterName) {
  switch (filterName) {
    case "Завтрак включён":
      return hotel.amenities.breakfastIncluded;
    case "Очень хорошо: 8+":
      return hotel.amenities.review8;
    case "Отели":
      return hotel.propertyType === "hotel";
    case "4 звезды":
      return hotel.stars >= 4;
    case "Бассейн":
      return hotel.amenities.pool;
    case "Бесплатный Wi-Fi":
      return hotel.amenities.wifi;
    case "Апартаменты/квартиры":
      return hotel.propertyType === "apartment";
    case "Без предоплаты":
      return hotel.noPrep;
    case "Включён завтрак и ужин":
      return hotel.amenities.breakfastDinner;
    case "С собственной кухней":
    case "Кухня/мини-кухня":
      return hotel.amenities.kitchen;
    case "Парковка":
      return hotel.amenities.parking;
    case "Спа и оздоровительный центр":
      return hotel.amenities.spa;
    case "Гидромассажная ванна/джакузи":
      return hotel.amenities.jacuzzi;
    case "Собственная ванная комната":
      return hotel.amenities.privateBathroom;
    case "Кондиционер":
      return hotel.amenities.airConditioning;
    case "Балкон":
      return hotel.amenities.balcony;
    case "Вид на море":
      return hotel.amenities.seaView;
    case "Дома для отпуска":
      return false;
    case "Общежития":
      return false;
    case "Хостелы":
      return hotel.propertyType === "hostel";
    case "Гостевые дома":
      return hotel.propertyType === "guesthouse";
    case "Дома и апартаменты целиком":
      return hotel.propertyType === "apartment";
    case "Варианты, подходящие для семей":
      return hotel.amenities.familyFriendly;
    case "Превосходно: 9+":
      return hotel.amenities.review9;
    case "Хорошо: 7+":
      return hotel.amenities.review7;
    case "Достаточно хорошо: 6+":
      return hotel.amenities.review6;
    case "1 звезда":
      return hotel.stars === 1;
    case "2 звезды":
      return hotel.stars === 2;
    case "3 звезды":
      return hotel.stars === 3;
    case "5 звезд":
      return hotel.stars === 5;
    case "Меньше 1 км":
      return hotel.distanceKm < 1;
    case "Меньше 3 км":
      return hotel.distanceKm < 3;
    case "Меньше 5 км":
      return hotel.distanceKm < 5;
    case "Бесплатная отмена":
      return hotel.freeCancel;
    case "Бронирование без кредитной карты":
      return hotel.amenities.noCreditCard;
    default:
      return hotel.brand === filterName;
  }
}

const RATING_LABELS = {
  9.5: "Великолепно",
  9.3: "Превосходно",
  9.2: "Превосходно",
  9.1: "Превосходно",
  8.9: "Потрясающе",
  8.8: "Потрясающе",
  8.7: "Потрясающе",
  8.6: "Потрясающе",
  8.1: "Очень хорошо",
  7.7: "Хорошо",
  6.6: "Оценка по отзывам",
};

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [liked, setLiked] = useState({});
  const [showMap, setShowMap] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");
  const [viewMode, setViewMode] = useState("list");
  const [activeFilters, setActiveFilters] = useState({});
  const [budgetMax, setBudgetMax] = useState(2500000);
  const [roomCounts, setRoomCounts] = useState({
    bedrooms: 0,
    bathrooms: 0,
  });
  const [visibleCount, setVisibleCount] = useState(10);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true);
  const [showPrivateBanner, setShowPrivateBanner] = useState(true);

  // Read destination from URL
  const searchParams = new URLSearchParams(location.search);
  const rawDestination = searchParams.get("destination") || "";

  // Resolve city name
  const resolvedCity = useMemo(() => {
    const lower = rawDestination.toLowerCase().trim();
    return CITY_ALIASES[lower] || rawDestination || "Ташкент";
  }, [rawDestination]);

  const { data: backendHotels = [], isLoading: isHotelsLoading } =
    useSearchHotels({
      destination: resolvedCity,
    });

  const CITY_COUNTRIES = {
    Дубай: "ОАЭ",
    Dubai: "ОАЭ",
    Стамбул: "Турция",
    Istanbul: "Турция",
    Алматы: "Казахстан",
    Хива: "Узбекистан",
    Коканд: "Узбекистан",
    Ташкент: "Узбекистан",
    Тбилиси: "Грузия",
  };

  const backendCityHotels = useMemo(
    () =>
      (backendHotels || []).map((hotel) =>
        enrichHotel(adaptBackendHotel(hotel, resolvedCity)),
      ),
    [backendHotels, resolvedCity],
  );

  const resolvedCountry =
    backendHotels?.[0]?.country || CITY_COUNTRIES[resolvedCity] || "Узбекистан";

  const cityHotels = backendCityHotels;
  const hasActiveDestination = Boolean(rawDestination.trim());
  const isEmptyResults =
    !isHotelsLoading && hasActiveDestination && !cityHotels.length;

  const filterCounts = useMemo(() => {
    const counts = {};

    FILTERS_LEFT.forEach((section) => {
      if (section.type !== "check") return;

      section.items.forEach((item) => {
        if (counts[item.name] !== undefined) return;
        counts[item.name] = cityHotels.filter((hotel) =>
          matchesNamedFilter(hotel, item.name),
        ).length;
      });
    });

    return counts;
  }, [cityHotels]);

  const filteredHotels = useMemo(() => {
    const enabledFilters = Object.entries(activeFilters)
      .filter(([, isEnabled]) => isEnabled)
      .map(([filterName]) => filterName);

    let nextHotels = cityHotels.filter(
      (hotel) => hotel.priceValue <= budgetMax,
    );

    if (roomCounts.bedrooms > 0) {
      nextHotels = nextHotels.filter(
        (hotel) => hotel.bedrooms >= roomCounts.bedrooms,
      );
    }

    if (roomCounts.bathrooms > 0) {
      nextHotels = nextHotels.filter(
        (hotel) => hotel.bathrooms >= roomCounts.bathrooms,
      );
    }

    enabledFilters.forEach((filterName) => {
      nextHotels = nextHotels.filter((hotel) =>
        matchesNamedFilter(hotel, filterName),
      );
    });

    switch (sortBy) {
      case "priceAsc":
        return [...nextHotels].sort((a, b) => a.priceValue - b.priceValue);
      case "priceDesc":
        return [...nextHotels].sort((a, b) => b.priceValue - a.priceValue);
      case "ratingDesc":
        return [...nextHotels].sort((a, b) => b.rating - a.rating);
      case "distanceAsc":
        return [...nextHotels].sort((a, b) => a.distanceKm - b.distanceKm);
      default:
        return [...nextHotels].sort((a, b) => {
          if (b.recommended !== a.recommended)
            return Number(b.recommended) - Number(a.recommended);
          if (b.genius !== a.genius) return Number(b.genius) - Number(a.genius);
          return b.rating - a.rating;
        });
    }
  }, [activeFilters, budgetMax, cityHotels, roomCounts, sortBy]);

  useEffect(() => {
    setVisibleCount(10);
  }, [rawDestination, activeFilters, budgetMax, roomCounts, sortBy]);

  const blue = "#003580";
  const blueLight = "#0071c2";
  const yellow = "#febb02";
  const border = "#e7e7e7";
  const light = "#6b6b6b";
  const green = "#008009";

  const toggleLike = (id) => setLiked((l) => ({ ...l, [id]: !l[id] }));
  const toggleSection = (label) =>
    setCollapsedSections((s) => ({ ...s, [label]: !s[label] }));

  const cycleSort = () => {
    const currentIndex = SORT_OPTIONS.findIndex(
      (option) => option.value === sortBy,
    );
    const nextOption = SORT_OPTIONS[(currentIndex + 1) % SORT_OPTIONS.length];
    setSortBy(nextOption.value);
  };

  const updateRoomCount = (key, delta) => {
    setRoomCounts((current) => ({
      ...current,
      [key]: Math.max(0, current[key] + delta),
    }));
  };

  const visibleHotels = filteredHotels.slice(0, visibleCount);
  const currentSortLabel =
    SORT_OPTIONS.find((option) => option.value === sortBy)?.label ||
    SORT_OPTIONS[0].label;

  const getRatingColor = (r) =>
    r >= 9 ? blue : r >= 8 ? blue : r >= 7 ? "#0071c2" : "#6b6b6b";

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", color: "#333" }}>
      <Header />

      {showMap && (
        <div
          onClick={() => setShowMap(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.45)",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxHeight: "80vh",
              width: "100%",
              maxWidth: 1024,
              overflow: "auto",
              borderRadius: 12,
              background: "#fff",
              padding: 20,
            }}
          >
            <div
              style={{
                marginBottom: 16,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>
                  Карта вариантов: {resolvedCity}
                </div>
                <div style={{ fontSize: 14, color: "#6b6b6b" }}>
                  Показано {filteredHotels.length} вариантов по выбранным
                  фильтрам
                </div>
              </div>
              <button
                onClick={() => setShowMap(false)}
                style={{
                  cursor: "pointer",
                  border: "none",
                  background: "transparent",
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div
              style={{
                position: "relative",
                minHeight: 280,
                overflow: "hidden",
                borderRadius: 12,
                border: "1px solid var(--booking-border)",
                background: "linear-gradient(to bottom, #eef6ff, #f6f7f9)",
                padding: 20,
              }}
            >
              {filteredHotels.slice(0, 12).map((hotel, index) => (
                <button
                  key={hotel.id}
                  onClick={() => {
                    setShowMap(false);
                    navigate(`/hotel/${hotel.id}`);
                  }}
                  style={{
                    position: "absolute",
                    top: `${18 + (index % 4) * 22}%`,
                    left: `${10 + (index % 3) * 26 + Math.floor(index / 4) * 6}%`,
                    cursor: "pointer",
                    borderRadius: 999,
                    border: "2px solid #fff",
                    background: blueLight,
                    padding: "6px 10px",
                    fontSize: 12,
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.16)",
                  }}
                >
                  {hotel.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "12px 16px" }}>
        <div
          style={{
            marginBottom: 12,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            color: blueLight,
          }}
        >
          <a href="#" style={{ color: blueLight, textDecoration: "none" }}>
            Главная
          </a>{" "}
          ›{" "}
          <a href="#" style={{ color: blueLight, textDecoration: "none" }}>
            {resolvedCountry}
          </a>{" "}
          ›{" "}
          <a href="#" style={{ color: blueLight, textDecoration: "none" }}>
            {resolvedCity}
          </a>{" "}
          › Результаты поиска
        </div>

        <div className="search-results-layout">
          <div className="search-results-sidebar">
            <div
              style={{
                position: "relative",
                marginBottom: 12,
                height: 120,
                cursor: "pointer",
                overflow: "hidden",
                borderRadius: 4,
                border: "1px solid var(--booking-border)",
                background: "#e8f0e8",
              }}
              onClick={() => setShowMap(true)}
            >
              <img
                src="https://picsum.photos/seed/mapthumb/300/120"
                alt="map"
                style={{
                  height: "100%",
                  width: "100%",
                  objectFit: "cover",
                  opacity: 0.7,
                }}
              />
              {[
                { t: "20%", l: "30%" },
                { t: "40%", l: "55%" },
                { t: "60%", l: "35%" },
                { t: "35%", l: "70%" },
              ].map((pos, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: pos.t,
                    left: pos.l,
                    height: 8,
                    width: 8,
                    borderRadius: "50%",
                    border: "2px solid #fff",
                    background: blueLight,
                  }}
                />
              ))}
              <button
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  borderRadius: 4,
                  border: "none",
                  background: blueLight,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                📍 Показать на карте
              </button>
            </div>

            <div style={{ marginBottom: 12, fontSize: 16, fontWeight: 700 }}>
              Все фильтры
            </div>

            {FILTERS_LEFT.map((section, si) => {
              const sec = {
                ...section,
                label: section.label.replace("__CITY__", resolvedCity),
              };
              return (
                <div
                  key={si}
                  style={{
                    marginBottom: 12,
                    borderTop: "1px solid var(--booking-border)",
                    paddingTop: 12,
                  }}
                >
                  <div
                    style={{
                      marginBottom: 8,
                      display: "flex",
                      cursor: "pointer",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                    onClick={() => toggleSection(section.label)}
                  >
                    {sec.label}
                    <ChevronDown
                      size={14}
                      color="#888"
                      style={{
                        transform: collapsedSections[section.label]
                          ? "rotate(180deg)"
                          : "none",
                      }}
                    />
                  </div>

                  {!collapsedSections[section.label] && (
                    <>
                      {section.type === "range" && (
                        <div>
                          <div
                            style={{
                              marginBottom: 8,
                              fontSize: 14,
                              color: "#6b6b6b",
                            }}
                          >
                            UZS 0 — UZS {budgetMax.toLocaleString("ru-RU")}
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={5000000}
                            value={budgetMax}
                            onChange={(e) =>
                              setBudgetMax(Number(e.target.value))
                            }
                            style={{ width: "100%" }}
                          />
                        </div>
                      )}
                      {section.type === "check" && (
                        <div>
                          {section.items
                            .slice(
                              0,
                              collapsedSections[section.label + "_more"]
                                ? 999
                                : 8,
                            )
                            .map((item, ii) => (
                              <label
                                key={ii}
                                style={{
                                  marginBottom: 6,
                                  display: "flex",
                                  cursor: "pointer",
                                  alignItems: "flex-start",
                                  gap: 8,
                                  fontSize: 13,
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={!!activeFilters[item.name]}
                                  onChange={(e) =>
                                    setActiveFilters((f) => ({
                                      ...f,
                                      [item.name]: e.target.checked,
                                    }))
                                  }
                                  style={{ marginTop: 2, flexShrink: 0 }}
                                />
                                <span style={{ flex: 1 }}>
                                  {item.name}
                                  {item.sub && (
                                    <div
                                      style={{ fontSize: 11, color: "#6b6b6b" }}
                                    >
                                      {item.sub}
                                    </div>
                                  )}
                                </span>
                                {item.count !== undefined && (
                                  <span
                                    style={{
                                      flexShrink: 0,
                                      fontSize: 12,
                                      color: "#6b6b6b",
                                    }}
                                  >
                                    {filterCounts[item.name] ?? item.count}
                                  </span>
                                )}
                              </label>
                            ))}
                          {section.items.length > 8 && (
                            <button
                              onClick={() =>
                                setCollapsedSections((s) => ({
                                  ...s,
                                  [section.label + "_more"]:
                                    !s[section.label + "_more"],
                                }))
                              }
                              style={{
                                display: "none",
                              }}
                            >
                              {collapsedSections[section.label + "_more"]
                                ? `Показать все ${section.items.length} фильтров ∧`
                                : `Показать все ${section.items.length} фильтров ∨`}
                            </button>
                          )}
                        </div>
                      )}
                      {section.type === "counter" && (
                        <div>
                          {section.items.map((item, ii) => (
                            <div
                              key={ii}
                              style={{
                                marginBottom: 8,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                fontSize: 13,
                              }}
                            >
                              <span>{item.name}</span>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <button
                                  onClick={() =>
                                    updateRoomCount(
                                      item.name === "Спальни"
                                        ? "bedrooms"
                                        : "bathrooms",
                                      -1,
                                    )
                                  }
                                  style={{
                                    display: "flex",
                                    height: 24,
                                    width: 24,
                                    cursor: "pointer",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 4,
                                    border: "1px solid var(--booking-border)",
                                    background: "#fff",
                                    fontSize: 16,
                                  }}
                                >
                                  −
                                </button>
                                <span>
                                  {item.name === "Спальни"
                                    ? roomCounts.bedrooms
                                    : roomCounts.bathrooms}
                                </span>
                                <button
                                  onClick={() =>
                                    updateRoomCount(
                                      item.name === "Спальни"
                                        ? "bedrooms"
                                        : "bathrooms",
                                      1,
                                    )
                                  }
                                  style={{
                                    display: "flex",
                                    height: 24,
                                    width: 24,
                                    cursor: "pointer",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 4,
                                    border: "1px solid var(--booking-border)",
                                    background: "#fff",
                                    fontSize: 16,
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="search-results-content">
            <div className="search-results-header">
              <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>
                {resolvedCity}: найдено {filteredHotels.length} вариантов
                проживания
              </h1>
              <div className="search-results-view-buttons">
                <button
                  onClick={() => setViewMode("list")}
                  style={{
                    cursor: "pointer",
                    borderRadius: 4,
                    border: `1px solid ${viewMode === "list" ? blueLight : "var(--booking-border)"}`,
                    padding: "6px 12px",
                    fontSize: 13,
                    background: viewMode === "list" ? "#ebf3ff" : "#fff",
                    color: viewMode === "list" ? blueLight : "#333",
                  }}
                >
                  Список
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  style={{
                    cursor: "pointer",
                    borderRadius: 4,
                    border: `1px solid ${viewMode === "table" ? blueLight : "var(--booking-border)"}`,
                    padding: "6px 12px",
                    fontSize: 13,
                    background: viewMode === "table" ? "#ebf3ff" : "#fff",
                    color: viewMode === "table" ? blueLight : "#333",
                  }}
                >
                  Таблица
                </button>
              </div>
            </div>

            <div
              style={{
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <button
                onClick={cycleSort}
                style={{
                  display: "flex",
                  cursor: "pointer",
                  alignItems: "center",
                  gap: 4,
                  borderRadius: 999,
                  border: "1px solid var(--booking-border)",
                  background: "#fff",
                  padding: "6px 14px",
                  fontSize: 13,
                }}
              >
                ↕ Сортировать: {currentSortLabel} <ChevronDown size={12} />
              </button>
            </div>

            {isHotelsLoading && (
              <div
                style={{
                  marginBottom: 12,
                  borderRadius: 4,
                  border: "1px solid var(--booking-border)",
                  background: "#fff",
                  padding: "12px 14px",
                  fontSize: 13,
                  color: "#6b6b6b",
                }}
              >
                Загружаем варианты размещения из Supabase…
              </div>
            )}

            {isEmptyResults && (
              <div
                style={{
                  marginBottom: 12,
                  borderRadius: 6,
                  border: "1px solid var(--booking-border)",
                  background: "#fff",
                  padding: 16,
                }}
              >
                <div style={{ marginBottom: 4, fontSize: 16, fontWeight: 700 }}>
                  Пока нет отелей для направления {resolvedCity}
                </div>
                <div style={{ fontSize: 13, color: "#6b6b6b" }}>
                  Страница теперь показывает только реальные данные из Supabase.
                  Попробуйте другой город или добавьте записи в таблицу
                  `hotels`.
                </div>
              </div>
            )}

            {showPrivacyBanner && (
              <div
                className="search-results-banner"
                style={{
                  marginBottom: 12,
                  borderRadius: 4,
                  border: "1px solid var(--booking-border)",
                  background: "#fff",
                  padding: "10px 14px",
                  fontSize: 13,
                }}
              >
                <Info size={16} color={blueLight} />
                <span style={{ flex: 1 }}>
                  На нашем сайте недоступно 85% вариантов жилья по этому
                  направлению на выбранные вами даты.
                </span>
                <button
                  onClick={() => setShowPrivacyBanner(false)}
                  style={{
                    cursor: "pointer",
                    border: "none",
                    background: "transparent",
                  }}
                >
                  <X size={16} color="#888" />
                </button>
              </div>
            )}

            {viewMode === "table" ? (
              <div
                style={{
                  marginBottom: 16,
                  overflowX: "auto",
                  borderRadius: 6,
                  border: "1px solid var(--booking-border)",
                  background: "#fff",
                }}
              >
                <div
                  className="search-results-table-header"
                  style={{
                    borderBottom: "1px solid var(--booking-border)",
                    padding: "12px 16px",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  <span>Вариант</span>
                  <span>Оценка</span>
                  <span>До центра</span>
                  <span>Питание</span>
                  <span>Цена</span>
                </div>
                {visibleHotels.map((hotel) => (
                  <button
                    key={hotel.id}
                    onClick={() => navigate(`/hotel/${hotel.id}`)}
                    className="search-results-table-row"
                    style={{
                      cursor: "pointer",
                      borderBottom: "1px solid var(--booking-border)",
                      background: "#fff",
                      padding: "12px 16px",
                      textAlign: "left",
                    }}
                  >
                    <span>
                      <div style={{ fontWeight: 700, color: blueLight }}>
                        {hotel.name}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b6b6b" }}>
                        {hotel.city}
                      </div>
                    </span>
                    <span style={{ fontWeight: 700 }}>{hotel.rating}</span>
                    <span>{hotel.dist}</span>
                    <span>{hotel.breakfast ? "Завтрак" : "Без питания"}</span>
                    <span style={{ fontWeight: 700 }}>{hotel.price}</span>
                  </button>
                ))}
              </div>
            ) : (
              <>
                {/* Hotel cards */}
                {visibleHotels.map((hotel, idx) => (
                  <div key={hotel.id}>
                    {idx === 11 && (
                      <div
                        style={{
                          marginBottom: 12,
                          borderRadius: 4,
                          border: "1px solid var(--booking-border)",
                          background: "#fff",
                          padding: 16,
                        }}
                      >
                        <div
                          style={{
                            marginBottom: 4,
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <span style={{ fontSize: 16, fontWeight: 700 }}>
                            Чем заняться в городе {resolvedCity}
                          </span>
                          <span
                            style={{
                              borderRadius: 4,
                              background: blue,
                              padding: "2px 8px",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#fff",
                            }}
                          >
                            Genius
                          </span>
                          <span
                            style={{
                              borderRadius: 4,
                              background: green,
                              padding: "2px 8px",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#fff",
                            }}
                          >
                            До −10%
                          </span>
                          <Info size={14} color={light} />
                        </div>
                        <div
                          style={{
                            marginBottom: 12,
                            fontSize: 13,
                            color: "#6b6b6b",
                          }}
                        >
                          Сэкономьте до 10% на ряде вариантов досуга
                        </div>
                        <div className="search-results-activities-grid">
                          {ACTIVITIES.map((act, i) => (
                            <div
                              key={i}
                              style={{
                                overflow: "hidden",
                                borderRadius: 4,
                                border: "1px solid var(--booking-border)",
                              }}
                            >
                              <img
                                src={act.image}
                                alt={act.name}
                                style={{
                                  height: 120,
                                  width: "100%",
                                  objectFit: "cover",
                                }}
                              />
                              <div style={{ padding: 10 }}>
                                <div
                                  style={{
                                    marginBottom: 4,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    lineHeight: 1.3,
                                  }}
                                >
                                  {act.name}
                                </div>
                                <div
                                  style={{
                                    marginBottom: 4,
                                    fontSize: 11,
                                    color: "#f5a623",
                                  }}
                                >
                                  {"★".repeat(Math.floor(act.rating))}{" "}
                                  <span style={{ color: "#6b6b6b" }}>
                                    {act.rating} ({act.reviews} отзывов)
                                  </span>
                                </div>
                                <div
                                  style={{
                                    marginBottom: 2,
                                    fontSize: 11,
                                    color: "#6b6b6b",
                                  }}
                                >
                                  Билеты от
                                </div>
                                {act.priceOld && (
                                  <div
                                    style={{
                                      fontSize: 11,
                                      color: "#e00",
                                      textDecoration: "line-through",
                                    }}
                                  >
                                    {act.priceOld}
                                  </div>
                                )}
                                <div style={{ fontSize: 13, fontWeight: 700 }}>
                                  {act.price}
                                </div>
                                {act.freeCancel && (
                                  <div
                                    style={{
                                      marginTop: 4,
                                      fontSize: 11,
                                      color: "#008009",
                                    }}
                                  >
                                    Доступна бесплатная отмена
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          <button
                            className="search-results-activity-arrow"
                            style={{
                              display: "flex",
                              height: 28,
                              width: 28,
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "50%",
                              border: "1px solid var(--booking-border)",
                              background: "#fff",
                            }}
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                        <a
                          href="#"
                          style={{
                            marginTop: 8,
                            display: "block",
                            textAlign: "right",
                            fontSize: 13,
                            color: blueLight,
                            textDecoration: "none",
                          }}
                        >
                          Посмотреть все
                        </a>
                      </div>
                    )}

                    {idx === 12 && showPrivateBanner && (
                      <div
                        className="search-results-private-banner"
                        style={{
                          marginBottom: 12,
                          borderRadius: 4,
                          border: "1px solid var(--booking-border)",
                          background: "#fff",
                          padding: 16,
                        }}
                      >
                        <img
                          src="https://picsum.photos/seed/private/80/60"
                          alt=""
                          style={{
                            height: 60,
                            width: 80,
                            flexShrink: 0,
                            borderRadius: 4,
                            objectFit: "cover",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              marginBottom: 4,
                              fontSize: 15,
                              fontWeight: 700,
                            }}
                          >
                            Хотите больше личного пространства?
                          </div>
                          <div
                            style={{
                              marginBottom: 6,
                              fontSize: 13,
                              color: "#6b6b6b",
                            }}
                          >
                            Выберите дом или апартаменты целиком — и
                            наслаждайтесь спокойствием и уединением.
                          </div>
                          <a
                            href="#"
                            style={{ fontSize: 13, color: blueLight }}
                          >
                            Показать дома и апартаменты целиком
                          </a>
                        </div>
                        <button
                          onClick={() => setShowPrivateBanner(false)}
                          style={{
                            flexShrink: 0,
                            cursor: "pointer",
                            border: "none",
                            background: "transparent",
                            alignSelf: "flex-end",
                          }}
                        >
                          <X size={16} color="#888" />
                        </button>
                      </div>
                    )}

                    <div
                      className="search-results-card"
                      style={{
                        marginBottom: 10,
                        overflow: "hidden",
                        borderRadius: 4,
                        border: "1px solid var(--booking-border)",
                        background: "#fff",
                        transition: "box-shadow 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.boxShadow =
                          "0 2px 12px rgba(0,0,0,0.12)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.boxShadow = "none")
                      }
                      onClick={() => navigate(`/hotel/${hotel.id}`)}
                    >
                      <div className="search-results-card-image-wrap">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="search-results-card-image"
                          onError={(e) =>
                            (e.currentTarget.src = `https://picsum.photos/seed/h${hotel.id}/224/168`)
                          }
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(hotel.id);
                          }}
                          style={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            display: "flex",
                            height: 32,
                            width: 32,
                            cursor: "pointer",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "50%",
                            border: "none",
                            background: "rgba(255,255,255,0.9)",
                          }}
                        >
                          <Heart
                            size={16}
                            fill={liked[hotel.id] ? "#e00" : "none"}
                            color={liked[hotel.id] ? "#e00" : "#333"}
                          />
                        </button>
                      </div>

                      <div className="search-results-card-body">
                        <div className="search-results-card-main">
                          <div
                            style={{
                              marginBottom: 4,
                              display: "flex",
                              flexWrap: "wrap",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 16,
                                fontWeight: 700,
                                color: blueLight,
                              }}
                            >
                              {hotel.name}
                            </span>
                            {hotel.stars > 0 && (
                              <span style={{ fontSize: 13, color: "#f5a623" }}>
                                {"★".repeat(hotel.stars)}
                              </span>
                            )}
                            {hotel.genius && (
                              <span
                                style={{
                                  borderRadius: 4,
                                  background: blue,
                                  padding: "2px 6px",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: "#fff",
                                }}
                              >
                                Genius
                              </span>
                            )}
                            {hotel.badge === "Новинка на Booking.com" && (
                              <span
                                style={{
                                  borderRadius: 4,
                                  background: "#febb02",
                                  padding: "2px 6px",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: "#333",
                                }}
                              >
                                Новинка на Booking.com
                              </span>
                            )}
                            {hotel.badge === "Отмеченный вариант" && (
                              <span
                                style={{
                                  borderRadius: 4,
                                  border: "1px solid var(--booking-border)",
                                  padding: "2px 6px",
                                  fontSize: 11,
                                  color: "#555",
                                }}
                              >
                                Отмеченный вариант
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              marginBottom: 6,
                              fontSize: 12,
                              color: blueLight,
                            }}
                          >
                            <a
                              href="#"
                              style={{
                                textDecoration: "none",
                                color: blueLight,
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {hotel.city}
                            </a>{" "}
                            <a
                              href="#"
                              style={{
                                textDecoration: "none",
                                color: blueLight,
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Показать на карте
                            </a>{" "}
                            <span style={{ color: "#6b6b6b" }}>
                              {hotel.dist}
                            </span>
                          </div>

                          {hotel.seasonal && (
                            <div style={{ marginBottom: 6 }}>
                              <span
                                style={{
                                  borderRadius: 4,
                                  background: "#008009",
                                  padding: "2px 8px",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: "#fff",
                                }}
                              >
                                Сезонное предложение
                              </span>
                            </div>
                          )}

                          {hotel.recommended && (
                            <div style={{ marginBottom: 8 }}>
                              <span
                                style={{
                                  borderRadius: 4,
                                  border: "1px solid var(--booking-border)",
                                  padding: "2px 8px",
                                  fontSize: 12,
                                  color: "#555",
                                }}
                              >
                                Рекомендовано для вашей группы
                              </span>
                            </div>
                          )}

                          <div
                            style={{
                              marginBottom: 4,
                              fontSize: 13,
                              fontWeight: 600,
                              color: blueLight,
                            }}
                          >
                            {hotel.roomName}
                          </div>
                          <div
                            style={{
                              marginBottom: 4,
                              whiteSpace: "pre-line",
                              fontSize: 12,
                              lineHeight: 1.8,
                              color: "#6b6b6b",
                            }}
                          >
                            {hotel.roomDesc}
                          </div>
                          {hotel.freeChild && (
                            <div
                              style={{
                                marginBottom: 4,
                                fontSize: 12,
                                color: blueLight,
                              }}
                            >
                              Бесплатное проживание для вашего ребёнка
                            </div>
                          )}
                          {hotel.breakfast && (
                            <div
                              style={{
                                marginBottom: 4,
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#008009",
                              }}
                            >
                              Завтрак включён
                            </div>
                          )}
                          {hotel.freeCancel && (
                            <div
                              style={{
                                marginBottom: 2,
                                fontSize: 12,
                                color: "#008009",
                              }}
                            >
                              ✓ <strong>Бесплатная отмена</strong>
                            </div>
                          )}
                          {hotel.noPrep && (
                            <div style={{ fontSize: 12, color: "#008009" }}>
                              ✓ <strong>Предоплата не требуется</strong> —
                              платите на месте
                            </div>
                          )}
                        </div>

                        <div className="search-results-price-column">
                          <div className="search-results-rating-row">
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700 }}>
                                {hotel.ratingLabel}
                              </div>
                              <div style={{ fontSize: 12, color: "#6b6b6b" }}>
                                {hotel.reviews} отзывов
                              </div>
                              {hotel.ratingExtra && (
                                <div style={{ fontSize: 12, color: blueLight }}>
                                  {hotel.ratingExtra}
                                </div>
                              )}
                            </div>
                            <div
                              style={{
                                background: getRatingColor(hotel.rating),
                                flexShrink: 0,
                                borderRadius: 4,
                                borderBottomLeftRadius: 0,
                                padding: "4px 8px",
                                fontSize: 14,
                                fontWeight: 800,
                                color: "#fff",
                              }}
                            >
                              {hotel.rating}
                            </div>
                          </div>

                          <div>
                            <div
                              style={{
                                marginBottom: 2,
                                fontSize: 12,
                                color: "#6b6b6b",
                              }}
                            >
                              {hotel.nights} ночи, {hotel.adults} взрослых,{" "}
                              {hotel.children} ребёнок
                            </div>
                            {hotel.priceOld && (
                              <div
                                style={{
                                  marginBottom: 2,
                                  fontSize: 13,
                                  color: "#e00",
                                  textDecoration: "line-through",
                                }}
                              >
                                {hotel.priceOld}
                              </div>
                            )}
                            <div
                              style={{
                                marginBottom: 2,
                                fontSize: 28,
                                fontWeight: 700,
                              }}
                            >
                              {hotel.price} ℹ️
                            </div>
                            {hotel.taxIncl ? (
                              <div
                                style={{
                                  marginBottom: 10,
                                  fontSize: 11,
                                  color: "#6b6b6b",
                                }}
                              >
                                Включая налоги и сборы
                              </div>
                            ) : (
                              hotel.tax && (
                                <div
                                  style={{
                                    marginBottom: 10,
                                    fontSize: 11,
                                    color: "#6b6b6b",
                                  }}
                                >
                                  + налоги и сборы ({hotel.tax})
                                </div>
                              )
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/hotel/${hotel.id}`);
                              }}
                              style={{
                                display: "flex",
                                width: "100%",
                                cursor: "pointer",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 4,
                                borderRadius: 4,
                                border: "none",
                                background: blueLight,
                                padding: "10px 16px",
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#fff",
                              }}
                            >
                              Все варианты жилья <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Load more */}
            {visibleCount < filteredHotels.length ? (
              <div style={{ margin: "24px 0", textAlign: "center" }}>
                <button
                  onClick={() =>
                    setVisibleCount((v) =>
                      Math.min(v + 5, filteredHotels.length),
                    )
                  }
                  style={{
                    cursor: "pointer",
                    borderRadius: 4,
                    border: `1px solid ${blueLight}`,
                    background: "#fff",
                    padding: "10px 28px",
                    fontSize: 14,
                    fontWeight: 600,
                    color: blueLight,
                  }}
                >
                  Загрузить больше результатов
                </button>
              </div>
            ) : (
              <div style={{ margin: "24px 0", textAlign: "center" }}>
                <div
                  style={{
                    display: "inline-block",
                    borderRadius: 4,
                    border: "1px solid var(--booking-border)",
                    background: "#fff",
                    padding: "10px 28px",
                    fontSize: 14,
                    color: "#6b6b6b",
                  }}
                >
                  Показаны все варианты
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
