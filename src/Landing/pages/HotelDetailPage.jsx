import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { differenceInCalendarDays } from "date-fns";
import Header from "../../components/layout/Header.jsx";
import Footer from "../../components/layout/Footer.jsx";
import {
  BedDouble,
  CalendarDays,
  MapPin,
  Heart,
  Share2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Users,
} from "lucide-react";
import { useHotel } from "../../hooks/useQueries.js";
import useSearchStore from "../../Search/store/useSearchStore.js";
import DestinationDropdown from "../../Search/components/DestinationDropdown.jsx";
import DatePicker from "../../Search/components/DatePicker.jsx";
import GuestPicker from "../../Search/components/GuestPicker.jsx";

const NAV_TABS = [
  "Обзор",
  "Информация о варианте и стоимости",
  "Удобства и услуги",
  "Условия размещения",
  "Важная/правовая информация",
  "Отзывы гостей",
];

function clampScore(score) {
  return Math.min(10, Math.max(6, Number(score || 0)));
}

function formatScore(score) {
  const value = Number(score || 0);
  return value ? value.toFixed(1).replace(".", ",") : "—";
}

function formatDistance(distance) {
  if (distance === null || distance === undefined || distance === "") return "";
  const text = String(distance).trim();
  if (!text) return "";
  return /км|м|центр/i.test(text) ? text : `${text} км`;
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  if (!amount) return "Цена по запросу";
  return `UZS ${Math.round(amount).toLocaleString("ru-RU")}`;
}

function parseCurrencyAmount(value) {
  if (typeof value === "number") return value;
  return Number(String(value || "").replace(/[^\d]/g, "")) || 0;
}

function formatReviewCount(count) {
  return Number(count || 0).toLocaleString("ru-RU");
}

function buildHighlights(hotel) {
  const distance = formatDistance(hotel.distance);

  return [
    hotel.breakfast
      ? {
          icon: "🍳",
          title: "Доступен завтрак",
          sub: "Можно добавить к бронированию",
        }
      : {
          icon: "🛏️",
          title: hotel.type || "Комфортное размещение",
          sub: "Удобный вариант для поездки",
        },
    {
      icon: "⭐",
      title: hotel.ratingLabel || "Высокая оценка гостей",
      sub: hotel.rating
        ? `Оценка гостей: ${formatScore(hotel.rating)}`
        : "Актуальная информация о проживании",
    },
    {
      icon: "📍",
      title: hotel.city ? `Размещение в ${hotel.city}` : "Удобное расположение",
      sub: distance
        ? `${distance} до центра`
        : hotel.country || "Проверьте детали локации",
    },
    hotel.freeCancel
      ? {
          icon: "✅",
          title: "Бесплатная отмена",
          sub: hotel.noPrep
            ? "Для части тарифов без предоплаты"
            : "Гибкие условия бронирования",
        }
      : {
          icon: "💳",
          title: "Условия тарифа",
          sub: hotel.noPrep
            ? "Доступны тарифы без предоплаты"
            : "Уточняйте условия перед оплатой",
        },
  ];
}

function buildTopAmenities(hotel) {
  return [
    { icon: "📶", label: "Бесплатный Wi-Fi", dotted: true },
    hotel.breakfast ? { icon: "🍳", label: "Завтрак" } : null,
    hotel.freeCancel ? { icon: "✅", label: "Бесплатная отмена" } : null,
    hotel.noPrep ? { icon: "💳", label: "Предоплата не требуется" } : null,
    hotel.genius ? { icon: "🏷️", label: "Genius-тариф" } : null,
    hotel.type ? { icon: "🛏️", label: hotel.type } : null,
    hotel.stars
      ? { icon: "⭐", label: `${hotel.stars}-звёздочный вариант` }
      : null,
    hotel.city ? { icon: "📍", label: hotel.city } : null,
  ].filter(Boolean);
}

function buildRatingCats(hotel) {
  const base = clampScore(hotel.rating || 8.4);
  const make = (label, delta) => ({
    label,
    score: Number(clampScore(base + delta).toFixed(1)),
  });

  return [
    make("Персонал", 0.4),
    make("Удобства", -0.1),
    make("Чистота", 0.1),
    make("Комфорт", 0.1),
    make("Соотношение цена/качество", -0.2),
    make("Расположение", 0),
    make("Бесплатный Wi-Fi", 0.2),
  ];
}

function buildReviews(hotel) {
  const name = hotel.name || "этот вариант";
  const city = hotel.city || "городе";
  const type = hotel.type?.toLowerCase() || "варианте размещения";

  return [
    {
      name: "Amina",
      flag: "🇺🇿",
      country: "Узбекистан",
      text: `«Понравилось, что ${name} удобно расположен${hotel.city ? ` в ${city}` : ""}. Заселение прошло быстро, а сам ${type} оказался аккуратным и комфортным.»`,
    },
    {
      name: "Maksim",
      flag: "🇰🇿",
      country: "Казахстан",
      text: `«Хорошее соотношение цены и качества. ${hotel.breakfast ? "Завтрак был приятным бонусом. " : "Бронирование прошло без проблем. "}${hotel.freeCancel ? "Понравились гибкие условия отмены. " : "Описание соответствует ожиданиям. "}Вернулся бы сюда снова.»`,
    },
    {
      name: "Elena",
      flag: "🇷🇺",
      country: "Россия",
      text: `«Удобно использовать ${name} как базу для поездки по ${city}. ${hotel.distance ? `До центра примерно ${formatDistance(hotel.distance)}. ` : ""}Номер оставил хорошее впечатление.»`,
    },
  ];
}

function buildTravelerQuestions(hotel) {
  const name = hotel.name || "отеле";
  const city = hotel.city || "городе";

  return [
    `Здесь подают завтрак в ${name}?`,
    `Есть ли трансфер от/до аэропорта для гостей ${name}?`,
    `Во сколько проходит заезд и отъезд в ${name}?`,
    `Есть ли рядом парковка или удобный подъезд к ${name}?`,
    `Насколько далеко ${name} находится от центра ${city}?`,
    `Есть ли в ${name} варианты для семейного размещения?`,
    `Как работают Wi‑Fi и интернет в ${name}?`,
    `Можно ли выбрать тариф без предоплаты для ${name}?`,
    `Что есть рядом с ${name}: рестораны, кафе и транспорт?`,
    `Какие условия отмены действуют для ${name}?`,
  ];
}

function buildRooms(hotel) {
  const basePrice = Number(hotel.price || 0) || 900000;
  const originalBasePrice =
    Number(hotel.priceOld || 0) || Math.round(basePrice * 1.18);
  const breakfastDelta = Math.round(basePrice * 0.18);
  const taxBase = Math.round(basePrice * 0.15);
  const roomType = hotel.type || "Номер";
  const breakfasts = hotel.breakfast
    ? "Завтрак включён"
    : `Завтрак по цене ${formatCurrency(Math.round(basePrice * 0.12))}`;

  return [
    {
      id: 1,
      name: `${roomType} Standard — ${hotel.name}`,
      urgent: "Количество номеров ограничено",
      beds: "1 большая двуспальная кровать",
      size: "28 кв. м",
      type: roomType,
      badges: [
        roomType,
        "28 кв. м",
        "Собственная ванная комната",
        "Кондиционер",
        "Бесплатный Wi-Fi",
      ],
      features: [
        "Кондиционер",
        "Телевизор с плоским экраном",
        "Рабочая зона",
        "Шкаф или гардероб",
        "Полотенца",
        "Фен",
      ],
      tariffs: [
        {
          meal: breakfasts,
          mealIncluded: hotel.breakfast,
          priceOld: formatCurrency(originalBasePrice),
          price: formatCurrency(basePrice),
          tax: formatCurrency(taxBase),
          discount: hotel.priceOld
            ? `-${Math.max(10, Math.round((1 - basePrice / originalBasePrice) * 100))}%`
            : "-15%",
          free_cancel: hotel.freeCancel,
          no_prepay: hotel.noPrep,
          no_card: hotel.noPrep,
        },
      ],
      guests: 2,
    },
    {
      id: 2,
      name: `${roomType} Deluxe`,
      urgent: "Осталось немного вариантов",
      beds: "1 очень большая двуспальная кровать",
      size: "34 кв. м",
      type: roomType,
      badges: [
        roomType,
        "34 кв. м",
        "Вид на город",
        "Собственная ванная комната",
        "Бесплатный Wi-Fi",
      ],
      features: [
        "Зона отдыха",
        "Мини-холодильник",
        "Чайник",
        "Сейф",
        "Телевизор",
        "Ежедневная уборка",
      ],
      tariffs: [
        {
          meal: hotel.breakfast ? "Завтрак включён" : breakfasts,
          mealIncluded: hotel.breakfast,
          priceOld: formatCurrency(Math.round(originalBasePrice * 1.08)),
          price: formatCurrency(Math.round(basePrice * 1.08)),
          tax: formatCurrency(Math.round(taxBase * 1.08)),
          discount: "-12%",
          free_cancel: hotel.freeCancel,
          no_prepay: hotel.noPrep,
          no_card: hotel.noPrep,
        },
        {
          meal: "Улучшенный тариф",
          mealIncluded: true,
          priceOld: formatCurrency(
            Math.round((originalBasePrice + breakfastDelta) * 1.08),
          ),
          price: formatCurrency(
            Math.round((basePrice + breakfastDelta) * 1.08),
          ),
          tax: formatCurrency(Math.round(taxBase * 1.12)),
          discount: "-10%",
          free_cancel: hotel.freeCancel,
          no_prepay: hotel.noPrep,
          no_card: hotel.noPrep,
        },
      ],
      guests: 2,
    },
    {
      id: 3,
      name: `${roomType} Family`,
      urgent: "Подходит для длительного проживания",
      beds: "1 большая двуспальная кровать\n1 диван-кровать",
      size: "42 кв. м",
      type: roomType,
      badges: [
        roomType,
        "42 кв. м",
        "Подходит для семьи",
        "Собственная ванная комната",
        "Бесплатный Wi-Fi",
      ],
      features: [
        "Дополнительная зона отдыха",
        "Место для багажа",
        "Рабочий стол",
        "Шторы blackout",
        "Телевизор",
        "Фен",
      ],
      tariffs: [
        {
          meal: hotel.breakfast ? "Завтрак включён" : breakfasts,
          mealIncluded: hotel.breakfast,
          priceOld: formatCurrency(Math.round(originalBasePrice * 1.2)),
          price: formatCurrency(Math.round(basePrice * 1.2)),
          tax: formatCurrency(Math.round(taxBase * 1.2)),
          discount: "-14%",
          free_cancel: hotel.freeCancel,
          no_prepay: hotel.noPrep,
          no_card: hotel.noPrep,
        },
      ],
      guests: 3,
    },
  ];
}

function buildFaq(hotel) {
  const name = hotel.name || "этот вариант";
  const city = hotel.city || "города";
  const distance = formatDistance(hotel.distance);

  return [
    {
      q: `Сколько человек может разместиться в ${name}?`,
      a: `В ${name} доступны варианты размещения для 2–3 гостей в зависимости от выбранного тарифа и категории номера.`,
    },
    {
      q: `Сколько стоит проживание в ${name}?`,
      a: `Стоимость проживания начинается от ${formatCurrency(hotel.price)} за ночь и зависит от дат поездки, тарифа и условий бронирования.`,
    },
    {
      q: `Какой завтрак подают в ${name}?`,
      a: hotel.breakfast
        ? `Для гостей ${name} доступны тарифы с завтраком. Точный формат завтрака зависит от выбранного предложения.`
        : `Завтрак можно добавить не ко всем тарифам. Перед бронированием проверьте выбранный вариант размещения в ${name}.`,
    },
    {
      q: `Есть ли в ${name} ресторан?`,
      a: `Информация о ресторане и питании отображается в доступных тарифах ${name}. Если питание важно, рекомендуем выбрать тариф с завтраком или уточнить условия при бронировании.`,
    },
    {
      q: `Есть ли в ${name} бассейн?`,
      a: `Актуальный список удобств ${name} смотрите в блоке «Самые популярные удобства и услуги» на этой странице.`,
    },
    {
      q: `Чем можно заняться в ${name}?`,
      a: `${name} подходит для отдыха и деловых поездок. Рядом доступны городские прогулки, кафе и основные точки интереса ${city}.`,
    },
    {
      q: `Во сколько в ${name} заезд и отъезд?`,
      a: `Стандартно заезд начинается с 14:00, а выезд — до 12:00. Точные условия по раннему заезду и позднему выезду уточняются у объекта размещения.`,
    },
    {
      q: `Далеко ли от ${name} до центра города ${city}?`,
      a: distance
        ? `Расстояние от ${name} до центра ${city} составляет примерно ${distance}.`
        : `${name} находится в ${city}. Подробное расположение указано в верхней части страницы.`,
    },
    {
      q: `Есть ли в ${name} семейные варианты размещения?`,
      a: `Да, в ${name} представлены варианты для разного числа гостей. Обратите внимание на раздел с типами номеров и доступными тарифами.`,
    },
    {
      q: `${name} подходит для поездки с детьми?`,
      a: `Да, гости часто выбирают ${name} для коротких и семейных поездок благодаря удобному расположению и гибким тарифам.`,
    },
  ];
}

function buildNearby(hotel) {
  const city = hotel.city || "города";
  const country = hotel.country || "страны";

  return {
    attractions: [
      { name: `Центр ${city}`, dist: formatDistance(hotel.distance) || "2 км" },
      { name: `Историческая часть ${city}`, dist: "3 км" },
      { name: `Панорамная точка ${city}`, dist: "5 км" },
      { name: `Главная площадь ${city}`, dist: "6 км" },
      { name: `Популярный городской парк ${city}`, dist: "7 км" },
    ],
    restaurants: [
      { name: `Кафе/бар · Центральное кафе ${city}`, dist: "300 м" },
      { name: `Ресторан · Local Kitchen ${city}`, dist: "450 м" },
      { name: `Кафе/бар · Coffee Point ${city}`, dist: "700 м" },
    ],
    beaches: [
      { name: `Набережная ${city}`, dist: "2,5 км" },
      { name: `Городская зона отдыха ${city}`, dist: "4 км" },
      { name: `Пляж/рекреационная зона ${country}`, dist: "6 км" },
      { name: `Семейная зона отдыха ${city}`, dist: "7 км" },
      { name: `Популярная прогулочная зона`, dist: "8 км" },
    ],
    transport: [
      { name: `Остановка общественного транспорта · ${city}`, dist: "250 м" },
      { name: `Станция метро/поезда · ${city}`, dist: "1,2 км" },
      { name: `Автовокзал · ${city}`, dist: "2,8 км" },
      { name: `Транспортный узел · ${city}`, dist: "3,4 км" },
    ],
    airports: [
      { name: `Международный аэропорт ${city}`, dist: "18 км" },
      { name: `Региональный аэропорт ${country}`, dist: "31 км" },
      { name: `Резервный аэропорт ${country}`, dist: "47 км" },
    ],
  };
}

function buildDescriptionParagraphs(hotel) {
  const name = hotel.name || "Этот объект";
  const city = hotel.city || "городе";
  const country = hotel.country ? `, ${hotel.country}` : "";
  const address = hotel.address ? ` по адресу ${hotel.address}` : "";
  const distance = formatDistance(hotel.distance);
  const description = hotel.description?.trim();

  return [
    description ||
      `${name} — ${hotel.type?.toLowerCase() || "вариант размещения"} в ${city}${country}${address}.`,
    `${name} подойдёт для поездки в ${city}: ${hotel.rating ? `гости оценивают проживание на ${formatScore(hotel.rating)}. ` : ""}${distance ? `Объект находится примерно в ${distance} от центра. ` : ""}${hotel.breakfast ? "Доступны тарифы с завтраком. " : ""}${hotel.freeCancel ? "Есть варианты с бесплатной отменой. " : ""}${hotel.noPrep ? "Для части предложений предоплата не требуется." : ""}`.trim(),
    `${hotel.type || "Вариант размещения"} удобно использовать как базу для отдыха или деловой поездки${hotel.city ? ` в ${city}` : ""}. В карточках тарифов на этой странице показаны условия бронирования, цена и число гостей.`,
  ];
}

function buildPropertySections(hotel) {
  const name = hotel.name || "объект";
  const city = hotel.city || "городе";
  const country = hotel.country || "стране";

  return [
    {
      title: "Информация о компании",
      text: `Объект ${name} размещён на нашей платформе и доступен для бронирования с актуальными тарифами и условиями проживания. Мы стараемся показывать понятную информацию о ценах, оценках гостей и локации в ${country}.`,
    },
    {
      title: "Информация об объекте размещения",
      text: `${name} — это ${hotel.type?.toLowerCase() || "вариант размещения"}${hotel.stars ? ` категории ${hotel.stars}★` : ""}, расположенный в ${city}. ${hotel.description ? "Описание объекта загружено из базы и показано выше на странице." : "Подробности по тарифам и категориям размещения указаны в разделе с номерами."}`,
    },
    {
      title: "Информация о районе",
      text: `${hotel.city ? `${city} — удобная отправная точка для прогулок, встреч и знакомства с городом.` : "Район подойдёт для разных сценариев поездки."} Рядом с ${name} можно найти транспорт, кафе и основные городские ориентиры, перечисленные в блоке ниже.`,
    },
  ];
}

export default function HotelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const searchBarRef = useRef(null);
  const overviewRef = useRef(null);
  const amenitiesRef = useRef(null);
  const availabilityRef = useRef(null);
  const reviewsRef = useRef(null);
  const legalRef = useRef(null);
  const policiesRef = useRef(null);
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState({});
  const [selectedTariffs, setSelectedTariffs] = useState({});
  const [selectedRoomTypes, setSelectedRoomTypes] = useState({});
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );

  const {
    destination,
    checkIn,
    checkOut,
    setDestination,
    showDestDropdown,
    showDatePicker,
    showGuestPicker,
    openDestDropdown,
    closeDestDropdown,
    openDatePicker,
    closeDatePicker,
    openGuestPicker,
    closeGuestPicker,
    closeAll,
    getDateLabel,
    getGuestLabel,
  } = useSearchStore();

  const { data: hotel, isLoading } = useHotel(id);

  const PHOTOS = Array.from({ length: 8 }, (_, i) =>
    hotel
      ? i === 0
        ? hotel.image
        : `https://picsum.photos/seed/det${hotel.id}_${i}/800/500`
      : `https://picsum.photos/seed/det_${i}/800/500`,
  );

  const toggleFaq = (i) => setOpenFaq((f) => ({ ...f, [i]: !f[i] }));

  const blue = "#003580";
  const blueLight = "#0071c2";
  const yellow = "#febb02";
  const border = "#e7e7e7";
  const light = "#6b6b6b";

  useEffect(() => {
    const handleClick = (e) => {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target)) {
        closeAll();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [closeAll]);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (hotel?.city && !destination) {
      setDestination(hotel.city);
    }
  }, [hotel?.city, destination, setDestination]);

  const handleSearch = () => {
    closeAll();
    navigate(
      `/search?destination=${encodeURIComponent(destination || hotel.city || "")}`,
    );
  };

  const handleDestSelect = (city) => {
    setDestination(city);
    closeDestDropdown();
    openDatePicker();
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff" }}>
        <Header />
        <div
          style={{
            maxWidth: 1150,
            margin: "60px auto",
            padding: "0 16px",
            textAlign: "center",
            color: "#888",
            fontSize: 16,
          }}
        >
          Загрузка...
        </div>
        <Footer />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff" }}>
        <Header />
        <div
          style={{
            maxWidth: 1150,
            margin: "60px auto",
            padding: "0 16px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 18, marginBottom: 16 }}>Отель не найден.</p>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "10px 24px",
              background: "#0071c2",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            На главную
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const hotelName = hotel.name || "Отель";
  const ratingText = formatScore(hotel.rating);
  const reviewsCountText = formatReviewCount(hotel.reviews);
  const distanceText = formatDistance(hotel.distance);
  const breadcrumbs = [
    "Главная",
    "Отели",
    hotel.type || "Варианты размещения",
    hotel.country,
    hotel.city,
    hotelName,
  ].filter(Boolean);
  const locationLine = [hotel.address, hotel.city, hotel.country]
    .filter(Boolean)
    .join(", ");
  const highlights = buildHighlights(hotel);
  const topAmenities = buildTopAmenities(hotel);
  const ratingCats = buildRatingCats(hotel);
  const reviews = buildReviews(hotel);
  const travelerQuestions = buildTravelerQuestions(hotel);
  const rooms = buildRooms(hotel);
  const roomTypes = [...new Set(rooms.map((room) => room.type))];
  const faq = buildFaq(hotel);
  const nearby = buildNearby(hotel);
  const descriptionParagraphs = buildDescriptionParagraphs(hotel);
  const propertySections = buildPropertySections(hotel);
  const featuredReview = reviews[0];
  const staffCategory = ratingCats.find((cat) => cat.label === "Персонал");
  const staffScore = staffCategory?.score || clampScore(hotel.rating || 8.8);
  const pairScore = formatScore(clampScore((hotel.rating || 8.6) + 0.2));
  const propertyScore = formatScore(clampScore((hotel.rating || 8.6) + 0.4));
  const nearbyTags = [
    `📍 ${hotel.city || "Удобное расположение"}`,
    hotel.freeCancel
      ? "✅ Гибкие условия бронирования"
      : "💳 Условия тарифа зависят от выбранного предложения",
    hotel.breakfast
      ? "🍳 Есть тарифы с завтраком"
      : "🛏️ Есть разные типы размещения",
    "🚶 Подходит для прогулок по району",
  ];
  const isTablet = viewportWidth < 1024;
  const isMobile = viewportWidth < 768;
  const photoPreviewCount = isMobile ? 3 : 4;
  const extraPhotosCount = Math.max(PHOTOS.length - photoPreviewCount, 0);
  const nights =
    checkIn && checkOut
      ? Math.max(1, differenceInCalendarDays(checkOut, checkIn))
      : 1;
  const nightWord = nights === 1 ? "ночь" : nights < 5 ? "ночи" : "ночей";
  const availabilityGridColumns = isMobile
    ? "240px 88px 150px 240px 124px"
    : "28% 10% 18% 28% 16%";
  const enabledRoomTypes = roomTypes.filter(
    (roomType) => selectedRoomTypes[roomType],
  );
  const visibleRooms = enabledRoomTypes.length
    ? rooms.filter((room) => enabledRoomTypes.includes(room.type))
    : rooms;
  const getTariffKey = (roomId, tariffIndex) => `${roomId}:${tariffIndex}`;
  const getTariffQty = (roomId, tariffIndex) =>
    Number(selectedTariffs[getTariffKey(roomId, tariffIndex)] || 0);
  const selectedTariffRows = rooms
    .flatMap((room) =>
      room.tariffs.map((tariff, tariffIndex) => ({
        room,
        tariff,
        tariffIndex,
        qty: getTariffQty(room.id, tariffIndex),
      })),
    )
    .filter((item) => item.qty > 0);
  const selectedRoomsCount = selectedTariffRows.reduce(
    (sum, item) => sum + item.qty,
    0,
  );
  const selectedStayTotal = selectedTariffRows.reduce(
    (sum, item) => sum + parseCurrencyAmount(item.tariff.price) * item.qty,
    0,
  );
  const selectedTaxesTotal = selectedTariffRows.reduce(
    (sum, item) => sum + parseCurrencyAmount(item.tariff.tax) * item.qty,
    0,
  );
  const selectedGrandTotal = selectedStayTotal + selectedTaxesTotal;
  const selectedNoCardOnly =
    selectedTariffRows.length > 0 &&
    selectedTariffRows.every((item) => item.tariff.no_card);
  const selectedTariffKeys = new Set(
    selectedTariffRows.map((item) =>
      getTariffKey(item.room.id, item.tariffIndex),
    ),
  );

  const scrollToSection = (ref, tabIndex) => {
    if (typeof tabIndex === "number") setActiveTab(tabIndex);
    ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleTabClick = (tabIndex) => {
    const refs = [
      overviewRef,
      availabilityRef,
      amenitiesRef,
      policiesRef,
      legalRef,
      reviewsRef,
    ];
    scrollToSection(refs[tabIndex], tabIndex);
  };

  const handleTariffQtyChange = (roomId, tariffIndex, value) => {
    setSelectedTariffs((current) => ({
      ...current,
      [getTariffKey(roomId, tariffIndex)]: Number(value),
    }));
  };

  const toggleRoomType = (roomType) => {
    setSelectedRoomTypes((current) => ({
      ...current,
      [roomType]: !current[roomType],
    }));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        color: "#333",
      }}
    >
      <Header />

      {/* Blue search bar */}
      <div style={{ background: blue, padding: "8px 0" }}>
        <div
          ref={searchBarRef}
          style={{
            maxWidth: 1150,
            margin: "0 auto",
            padding: "0 16px",
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: "1 1 260px",
              background: "#fff",
              border: `2px solid ${yellow}`,
              borderRadius: 4,
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              position: "relative",
            }}
          >
            <BedDouble size={16} color="#555" style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={destination}
              placeholder="Куда вы хотите поехать?"
              onChange={(e) => {
                setDestination(e.target.value);
                if (!showDestDropdown) openDestDropdown();
              }}
              onClick={openDestDropdown}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{
                flex: 1,
                minWidth: 0,
                border: "none",
                outline: "none",
                fontSize: 14,
                background: "transparent",
                color: "#333",
              }}
            />
            {!!destination && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDestination("");
                  openDestDropdown();
                }}
                style={{
                  marginLeft: "auto",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <X size={13} color="#888" />
              </button>
            )}
            {showDestDropdown && (
              <DestinationDropdown onSelect={handleDestSelect} />
            )}
          </div>
          <div
            onClick={() =>
              showDatePicker ? closeDatePicker() : openDatePicker()
            }
            style={{
              flex: "0 1 240px",
              background: "#fff",
              border: `2px solid ${yellow}`,
              borderRadius: 4,
              padding: "8px 14px",
              fontSize: 14,
              minWidth: 200,
              cursor: "pointer",
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CalendarDays size={16} color="#555" style={{ flexShrink: 0 }} />
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {getDateLabel()}
            </span>
            {showDatePicker && <DatePicker />}
          </div>
          <div
            onClick={() =>
              showGuestPicker ? closeGuestPicker() : openGuestPicker()
            }
            style={{
              flex: "0 1 260px",
              background: "#fff",
              border: `2px solid ${yellow}`,
              borderRadius: 4,
              padding: "8px 14px",
              fontSize: 14,
              minWidth: 220,
              cursor: "pointer",
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Users size={16} color="#555" style={{ flexShrink: 0 }} />
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {getGuestLabel()}
            </span>
            {showGuestPicker && <GuestPicker />}
          </div>
          <button
            onClick={handleSearch}
            style={{
              background: blueLight,
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "10px 24px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              minHeight: 44,
            }}
          >
            Найти
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1150, margin: "0 auto", padding: "12px 16px" }}>
        {/* Breadcrumb */}
        <div
          style={{
            fontSize: 12,
            color: blueLight,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexWrap: "wrap",
          }}
        >
          {breadcrumbs.map((b, i, arr) => (
            <span
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              {i < arr.length - 1 ? (
                <a
                  href="#"
                  style={{ color: blueLight, textDecoration: "none" }}
                >
                  {b}
                </a>
              ) : (
                <span style={{ color: "#333" }}>{b}</span>
              )}
              {i < arr.length - 1 && <ChevronRight size={11} color="#aaa" />}
            </span>
          ))}
        </div>

        {/* Inner nav */}
        <div
          style={{
            display: "flex",
            borderBottom: `1px solid ${border}`,
            marginBottom: 16,
            overflowX: "auto",
          }}
        >
          {NAV_TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => handleTabClick(i)}
              style={{
                padding: "12px 16px",
                border: "none",
                borderBottom:
                  activeTab === i
                    ? `2px solid ${blueLight}`
                    : "2px solid transparent",
                background: "none",
                color: activeTab === i ? blueLight : "#333",
                fontWeight: activeTab === i ? 700 : 400,
                fontSize: 14,
                cursor: "pointer",
                whiteSpace: "nowrap",
                marginBottom: -1,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Title row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 12,
            alignItems: isTablet ? "stretch" : "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
                flexWrap: "wrap",
              }}
            >
              {hotel.genius && (
                <span
                  style={{
                    background: blue,
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 4,
                  }}
                >
                  Genius
                </span>
              )}
              {!!hotel.stars && (
                <span
                  style={{ color: "#f5a623", fontSize: 18, letterSpacing: 2 }}
                >
                  {"★".repeat(Math.min(hotel.stars, 5))}
                </span>
              )}
              <span
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  padding: "2px 8px",
                  fontSize: 11,
                  color: "#555",
                }}
              >
                🌿 Сертификат устойчивого развития
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
              {hotelName}
            </h1>
            <div
              style={{
                fontSize: 13,
                color: blueLight,
                display: "flex",
                alignItems: "center",
                gap: 4,
                flexWrap: "wrap",
              }}
            >
              <MapPin size={13} />
              {locationLine || hotel.location || "Адрес уточняется"} —
              <a href="#" style={{ color: blueLight }}>
                Отличное расположение — посмотреть карту
              </a>
              {distanceText && ` — ${distanceText} до центра`}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: isTablet ? "stretch" : "flex-end",
              gap: 8,
              flexShrink: 0,
              width: isTablet ? "100%" : "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 6,
                justifyContent: isTablet ? "space-between" : "flex-end",
              }}
            >
              <button
                onClick={() => setLiked(!liked)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Heart
                  size={22}
                  fill={liked ? "#e00" : "none"}
                  color={liked ? "#e00" : "#333"}
                />
              </button>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Share2 size={20} color="#333" />
              </button>
            </div>
            <button
              onClick={() => navigate(`/checkout/${hotel.id}`)}
              style={{
                background: blueLight,
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "10px 20px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                width: isTablet ? "100%" : "auto",
              }}
            >
              Забронировать
            </button>
            <a
              href="#"
              style={{ color: blueLight, fontSize: 13, textDecoration: "none" }}
            >
              Мы возвращаем разницу в цене
            </a>
          </div>
        </div>

        {/* Photos + sidebar */}
        <div
          style={{
            display: "flex",
            flexDirection: isTablet ? "column" : "row",
            alignItems: "stretch",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "minmax(0, 2fr) minmax(220px, 1fr)",
                gap: 8,
                alignItems: "stretch",
              }}
            >
              <img
                src={PHOTOS[0]}
                alt=""
                style={{
                  width: "100%",
                  minHeight: isMobile ? 260 : 380,
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "repeat(2, minmax(0, 1fr))"
                    : "1fr",
                  gridAutoRows: isMobile ? 118 : "1fr",
                  gap: 8,
                  minWidth: 0,
                }}
              >
                {PHOTOS.slice(1, 3).map((photo, index) => (
                  <img
                    key={photo + index}
                    src={photo}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      minHeight: isMobile ? 118 : 186,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                ))}
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(3, minmax(0, 1fr))"
                  : "repeat(4, minmax(0, 1fr))",
                gap: 8,
                marginTop: 8,
              }}
            >
              {PHOTOS.slice(3, 3 + photoPreviewCount).map((p, i) => (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    minWidth: 0,
                    height: isMobile ? 88 : 96,
                  }}
                >
                  <img
                    src={p}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                  {i === photoPreviewCount - 1 && extraPhotosCount > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}
                      >
                        +{extraPhotosCount} фото
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: rating + map */}
          <div
            style={{
              width: isTablet ? "100%" : 280,
              flexShrink: 0,
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : isTablet
                  ? "repeat(2, minmax(0, 1fr))"
                  : "1fr",
              gap: 12,
            }}
          >
            <div
              style={{
                border: `1px solid ${border}`,
                borderRadius: 8,
                padding: 16,
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {hotel.ratingLabel || "Оценка гостей"}
                  </div>
                  <div style={{ fontSize: 12, color: light }}>
                    {reviewsCountText} отзывов
                  </div>
                </div>
                <div
                  style={{
                    background: blue,
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 18,
                    padding: "6px 10px",
                    borderRadius: "4px 4px 4px 0",
                  }}
                >
                  {ratingText}
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                Лучшие впечатления гостей
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontStyle: "italic",
                  lineHeight: 1.5,
                  borderLeft: `3px solid ${blueLight}`,
                  paddingLeft: 8,
                  color: "#444",
                }}
              >
                {featuredReview.text}
              </div>
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#00a550",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {featuredReview.name[0]}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600 }}>
                  {featuredReview.name}
                </span>
                <span style={{ fontSize: 11, color: light }}>
                  {featuredReview.flag} {featuredReview.country}
                </span>
              </div>
              <div
                style={{
                  borderTop: `1px solid ${border}`,
                  marginTop: 10,
                  paddingTop: 10,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                  Персонал
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      height: 4,
                      background: "#e0e0e0",
                      borderRadius: 2,
                    }}
                  >
                    <div
                      style={{
                        width: `${(staffScore / 10) * 100}%`,
                        height: "100%",
                        background: blue,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                  <span style={{ fontWeight: 700 }}>
                    {formatScore(staffScore)}
                  </span>
                </div>
              </div>
            </div>
            <div
              style={{
                border: `1px solid ${border}`,
                borderRadius: 8,
                overflow: "hidden",
                minHeight: 180,
                position: "relative",
              }}
            >
              <img
                src={`https://picsum.photos/seed/map${hotel.id}/480/320`}
                alt="map"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.75,
                }}
              />
              <button
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: blueLight,
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "5px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Показать на карте
              </button>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            overflowX: "auto",
          }}
        >
          {highlights.map((h, i) => (
            <div
              key={i}
              style={{
                border: `1px solid ${border}`,
                borderRadius: 4,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                minWidth: 190,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 22 }}>{h.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{h.title}</div>
                <div style={{ fontSize: 12, color: light }}>{h.sub}</div>
              </div>
              <ChevronRight size={14} color={blueLight} />
            </div>
          ))}
        </div>

        {/* 2-col layout */}
        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Description */}
            <div ref={overviewRef} style={{ marginBottom: 24 }}>
              {descriptionParagraphs.map((p, i) => (
                <p
                  key={i}
                  style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}
                >
                  {p}
                </p>
              ))}
              <p style={{ fontSize: 14, lineHeight: 1.7 }}>
                Парам особенно нравится расположение — они оценили проживание в
                этом районе вдвоём на <strong>{pairScore}</strong>.
              </p>
              <p style={{ fontSize: 11, color: light, marginTop: 6 }}>
                Расстояние, указанное в описании, рассчитано с помощью ©
                OpenStreetMap
              </p>
            </div>

            {/* Top amenities */}
            <div ref={amenitiesRef} style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
                Самые популярные удобства и услуги
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {topAmenities.map((a, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      minWidth: "30%",
                    }}
                  >
                    <span>{a.icon}</span>
                    <span
                      style={{
                        textDecoration: a.dotted ? "underline dotted" : "none",
                        color: a.dotted ? blueLight : "#333",
                      }}
                    >
                      {a.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div ref={availabilityRef} style={{ marginBottom: 32 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <h2 style={{ fontSize: 22, fontWeight: 800 }}>Наличие мест</h2>
                <a
                  href="#"
                  style={{
                    color: blueLight,
                    fontSize: 13,
                    textDecoration: "none",
                  }}
                >
                  🔄 Мы возвращаем разницу в цене
                </a>
              </div>
              <div style={{ fontSize: 13, color: light, marginBottom: 12 }}>
                Цены конвертированы в UZS ℹ️
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 16,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    border: `2px solid ${yellow}`,
                    borderRadius: 4,
                    padding: "8px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    background: "#fff",
                  }}
                >
                  📅 {getDateLabel()}
                </div>
                <div
                  style={{
                    border: `1px solid ${border}`,
                    borderRadius: 4,
                    padding: "8px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                  }}
                >
                  👥 {getGuestLabel()}
                </div>
                <button
                  onClick={() => scrollToSection(searchBarRef, 1)}
                  style={{
                    background: blueLight,
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "8px 18px",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Изменить параметры поиска
                </button>
              </div>

              <div style={{ marginBottom: 12, fontSize: 13 }}>
                <span style={{ fontWeight: 600, marginRight: 12 }}>
                  Тип размещения:
                </span>
                {roomTypes.map((l, i) => (
                  <label
                    key={i}
                    style={{
                      marginRight: 14,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      border: `1px solid ${selectedRoomTypes[l] ? blueLight : border}`,
                      background: selectedRoomTypes[l] ? "#f1f7ff" : "#fff",
                      color: selectedRoomTypes[l] ? blue : "#333",
                      borderRadius: 999,
                      padding: "6px 12px",
                      fontWeight: selectedRoomTypes[l] ? 700 : 500,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedRoomTypes[l]}
                      onChange={() => toggleRoomType(l)}
                    />{" "}
                    {l}
                  </label>
                ))}
              </div>

              {/* Rooms table */}
              <div
                style={{
                  border: `1px solid ${border}`,
                  borderRadius: 8,
                  overflow: "hidden",
                  overflowX: "auto",
                  boxShadow: "0 2px 10px rgba(15, 39, 95, 0.06)",
                }}
              >
                {/* Table header */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: availabilityGridColumns,
                    minWidth: isMobile ? 842 : undefined,
                    background: blue,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {[
                    "Тип размещения",
                    "Число гостей",
                    `Цена за ${nights} ${nightWord}`,
                    "Ваши варианты тарифов",
                    "Выберите количество",
                  ].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "10px 12px",
                        textAlign:
                          i === 1 || i === 2 || i === 4 ? "center" : "left",
                      }}
                    >
                      {h}
                    </div>
                  ))}
                </div>

                {visibleRooms.map((room, ri) => (
                  <div
                    key={room.id}
                    style={{
                      borderTop: ri === 0 ? "none" : `2px solid ${blue}`,
                    }}
                  >
                    {room.tariffs.map((tariff, ti) => {
                      const tariffKey = getTariffKey(room.id, ti);
                      const tariffQty = getTariffQty(room.id, ti);
                      const isTariffSelected =
                        selectedTariffKeys.has(tariffKey);

                      return (
                        <div
                          key={ti}
                          style={{
                            display: "grid",
                            gridTemplateColumns: availabilityGridColumns,
                            minWidth: isMobile ? 842 : undefined,
                            borderTop:
                              ti === 0 ? "none" : `1px solid ${border}`,
                            background: isTariffSelected
                              ? "#eef6ff"
                              : ti % 2 === 0
                                ? "#fff"
                                : "#fafcff",
                            boxShadow: isTariffSelected
                              ? `inset 4px 0 0 ${blueLight}`
                              : "none",
                          }}
                        >
                          {/* Room info - only first tariff row */}
                          {ti === 0 ? (
                            <div
                              style={{
                                padding: "12px",
                                borderRight: `1px solid ${border}`,
                                gridRow: `1 / ${room.tariffs.length + 1}`,
                              }}
                            >
                              <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                style={{
                                  color: blueLight,
                                  fontWeight: 600,
                                  fontSize: 13,
                                  display: "block",
                                  marginBottom: 6,
                                  lineHeight: 1.4,
                                }}
                              >
                                {room.name}
                              </a>
                              {room.urgent && (
                                <div
                                  style={{
                                    color: "#e00",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    marginBottom: 8,
                                  }}
                                >
                                  🔴 {room.urgent}
                                </div>
                              )}
                              <div
                                style={{
                                  fontSize: 12,
                                  marginBottom: 8,
                                  whiteSpace: "pre-line",
                                }}
                              >
                                {room.beds}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 4,
                                  marginBottom: 8,
                                }}
                              >
                                {room.badges.map((b, bi) => (
                                  <span
                                    key={bi}
                                    style={{
                                      border: `1px solid ${border}`,
                                      borderRadius: 3,
                                      padding: "2px 6px",
                                      fontSize: 11,
                                      color: "#444",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 3,
                                    }}
                                  >
                                    {bi === 0
                                      ? "🏠"
                                      : bi === 1
                                        ? "📐"
                                        : bi === 2
                                          ? "🍳"
                                          : bi === 3
                                            ? "🚿"
                                            : bi === 4
                                              ? "🌆"
                                              : bi === 5
                                                ? "❄️"
                                                : bi === 6
                                                  ? "📺"
                                                  : "📶"}{" "}
                                    {b}
                                  </span>
                                ))}
                              </div>
                              {room.features.length > 0 && (
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "#555",
                                    lineHeight: 1.8,
                                  }}
                                >
                                  {room.features.slice(0, 6).map((f, fi) => (
                                    <span key={fi}>✓ {f} </span>
                                  ))}
                                  <a
                                    href="#"
                                    onClick={(e) => e.preventDefault()}
                                    style={{ color: blueLight }}
                                  >
                                    Ещё
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div />
                          )}

                          {/* Guests */}
                          {ti === 0 ? (
                            <div
                              style={{
                                padding: "12px",
                                textAlign: "center",
                                borderRight: `1px solid ${border}`,
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "center",
                                paddingTop: 16,
                              }}
                            >
                              {"👤".repeat(room.guests)}
                            </div>
                          ) : (
                            <div
                              style={{ borderRight: `1px solid ${border}` }}
                            />
                          )}

                          {/* Price */}
                          <div
                            style={{
                              padding: "12px",
                              textAlign: "center",
                              borderRight: `1px solid ${border}`,
                            }}
                          >
                            <div
                              style={{
                                textDecoration: "line-through",
                                color: "#e00",
                                fontSize: 12,
                                marginBottom: 2,
                              }}
                            >
                              {tariff.priceOld}
                            </div>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: 15,
                                marginBottom: 2,
                              }}
                            >
                              {tariff.price} ℹ️
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: light,
                                marginBottom: 8,
                              }}
                            >
                              + налоги и сборы ({tariff.tax})
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 3,
                              }}
                            >
                              <span
                                style={{
                                  background: "#008009",
                                  color: "#fff",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: "2px 7px",
                                  borderRadius: 3,
                                }}
                              >
                                {tariff.discount}
                              </span>
                              {hotel.genius && (
                                <span
                                  style={{
                                    background: blue,
                                    color: "#fff",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    padding: "2px 8px",
                                    borderRadius: 3,
                                  }}
                                >
                                  Genius
                                </span>
                              )}
                              {isTariffSelected && (
                                <span
                                  style={{
                                    background: "#e8f4ff",
                                    color: blue,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    padding: "2px 8px",
                                    borderRadius: 999,
                                    border: `1px solid ${blueLight}`,
                                  }}
                                >
                                  Выбрано
                                </span>
                              )}
                              <span
                                style={{
                                  background: "#008009",
                                  color: "#fff",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: "2px 6px",
                                  borderRadius: 3,
                                }}
                              >
                                Сезонное предложение
                              </span>
                            </div>
                          </div>

                          {/* Tariff options */}
                          <div
                            style={{
                              padding: "12px",
                              borderRight: `1px solid ${border}`,
                              fontSize: 12,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: 4,
                                marginBottom: 6,
                              }}
                            >
                              <span>🍳</span>
                              <span
                                style={{
                                  color: tariff.mealIncluded
                                    ? blueLight
                                    : "#333",
                                  fontWeight: tariff.mealIncluded ? 600 : 400,
                                }}
                              >
                                {tariff.meal}
                              </span>
                            </div>
                            {tariff.free_cancel && (
                              <div
                                style={{ color: "#008009", marginBottom: 3 }}
                              >
                                ✓ <strong>Бесплатная отмена</strong> в любое
                                время
                              </div>
                            )}
                            {tariff.no_prepay && (
                              <div
                                style={{ color: "#008009", marginBottom: 3 }}
                              >
                                ✓ <strong>Предоплата не требуется</strong> —
                                платите на месте
                              </div>
                            )}
                            {tariff.no_card && (
                              <div style={{ color: light, marginBottom: 3 }}>
                                💳 Банковская карта не нужна
                              </div>
                            )}
                            <div style={{ color: light }}>
                              {hotel.genius
                                ? "✓ Genius-скидка 13% применяется к цене без учёта налогов и сборов"
                                : "✓ Доступны актуальные условия тарифа без скрытых сборов в описании предложения"}
                            </div>
                            {isTariffSelected && (
                              <div
                                style={{
                                  marginTop: 8,
                                  color: blue,
                                  fontWeight: 700,
                                }}
                              >
                                Вы добавили {tariffQty} шт. этого тарифа
                              </div>
                            )}
                          </div>

                          {/* Select */}
                          <div style={{ padding: "12px", textAlign: "center" }}>
                            <select
                              value={tariffQty}
                              onChange={(e) =>
                                handleTariffQtyChange(
                                  room.id,
                                  ti,
                                  e.target.value,
                                )
                              }
                              style={{
                                padding: "5px 8px",
                                border: `1px solid ${isTariffSelected ? blueLight : border}`,
                                borderRadius: 4,
                                fontSize: 14,
                                cursor: "pointer",
                                minWidth: 72,
                                fontWeight: isTariffSelected ? 700 : 500,
                                background: isTariffSelected
                                  ? "#f1f7ff"
                                  : "#fff",
                              }}
                            >
                              {[0, 1, 2, 3, 4, 5].map((n) => (
                                <option key={n}>{n}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Book button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 24,
                  marginTop: 16,
                  alignItems: isMobile ? "stretch" : "flex-start",
                  flexDirection: isMobile ? "column" : "row",
                  position: "sticky",
                  bottom: isMobile ? 0 : 16,
                  zIndex: 12,
                  padding:
                    selectedRoomsCount > 0
                      ? isMobile
                        ? "12px 12px 16px"
                        : "0"
                      : "0",
                  borderRadius: selectedRoomsCount > 0 ? 12 : 0,
                  background:
                    selectedRoomsCount > 0
                      ? "rgba(255,255,255,0.98)"
                      : "transparent",
                  boxShadow:
                    selectedRoomsCount > 0
                      ? "0 12px 32px rgba(15, 39, 95, 0.16)"
                      : "none",
                  backdropFilter: selectedRoomsCount > 0 ? "blur(6px)" : "none",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    border: `1px solid ${selectedRoomsCount > 0 ? blueLight : border}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                    background: selectedRoomsCount > 0 ? "#f5f9ff" : "#fafcff",
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                  >
                    {selectedRoomsCount > 0
                      ? `Вы выбрали ${selectedRoomsCount} вариант${selectedRoomsCount === 1 ? "" : selectedRoomsCount < 5 ? "а" : "ов"} на ${nights} ${nightWord}`
                      : "Выберите номер и тариф"}
                  </div>
                  <div style={{ fontSize: 13, color: light, lineHeight: 1.6 }}>
                    {selectedRoomsCount > 0 ? (
                      <>
                        <div>
                          Стоимость проживания:{" "}
                          {formatCurrency(selectedStayTotal)}
                        </div>
                        <div>
                          Налоги и сборы: {formatCurrency(selectedTaxesTotal)}
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#333",
                            marginTop: 4,
                          }}
                        >
                          Итого: {formatCurrency(selectedGrandTotal)}
                        </div>
                        <div style={{ marginTop: 4 }}>
                          {selectedNoCardOnly
                            ? "Карта для этих вариантов не требуется."
                            : "Оплата и карта зависят от выбранного тарифа."}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>Укажи количество напротив подходящего тарифа.</div>
                        <div>
                          После выбора кнопка бронирования станет активной.
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: isMobile ? "left" : "right" }}>
                  <button
                    onClick={() => navigate(`/checkout/${hotel.id}`)}
                    disabled={selectedRoomsCount === 0}
                    style={{
                      background:
                        selectedRoomsCount > 0 ? blueLight : "#bdbdbd",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "12px 24px",
                      fontSize: 16,
                      fontWeight: 700,
                      cursor:
                        selectedRoomsCount > 0 ? "pointer" : "not-allowed",
                      marginBottom: 8,
                      display: "block",
                      minWidth: isMobile ? "100%" : 220,
                      boxShadow:
                        selectedRoomsCount > 0
                          ? "0 8px 18px rgba(0, 113, 194, 0.28)"
                          : "none",
                    }}
                  >
                    {selectedRoomsCount > 0
                      ? `Я бронирую · ${formatCurrency(selectedGrandTotal)}`
                      : "Выберите вариант"}
                  </button>
                  <div
                    style={{ fontSize: 12, color: light, textAlign: "left" }}
                  >
                    <div>• Процесс займёт всего 2 минуты</div>
                    <div>
                      •{" "}
                      {selectedNoCardOnly
                        ? "Карта не потребуется"
                        : "Условия оплаты зависят от тарифа"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* No card banner */}
            <div
              style={{
                border: `1px solid ${border}`,
                borderRadius: 4,
                padding: "12px 16px",
                marginBottom: 24,
                display: "flex",
                gap: 10,
                fontSize: 13,
              }}
            >
              <span>💳</span>
              <span>
                <strong>
                  {selectedNoCardOnly
                    ? "Банковская карта не нужна"
                    : "Условия оплаты зависят от выбранного тарифа"}
                </strong>{" "}
                {selectedRoomsCount > 0
                  ? selectedNoCardOnly
                    ? "Для выбранных вами вариантов банковская карта не требуется."
                    : "Часть выбранных вами вариантов может потребовать карту или предоплату."
                  : "Для части вариантов банковская карта не нужна — выберите тариф, чтобы увидеть точные условия."}
              </span>
            </div>

            {/* Sustainability */}
            <div ref={legalRef} style={{ marginBottom: 32 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <h3 style={{ fontSize: 20, fontWeight: 800 }}>
                  Устойчивое развитие
                </h3>
                <button
                  onClick={() => scrollToSection(availabilityRef, 1)}
                  style={{
                    background: blueLight,
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "8px 16px",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Посмотреть места
                </button>
              </div>
              <p style={{ fontSize: 13, color: light, marginBottom: 12 }}>
                У этого варианта жилья есть следующее количество сторонних
                сертификатов устойчивого развития: 1.{" "}
                <a href="#" style={{ color: blueLight }}>
                  Подробнее о сертификатах
                </a>
              </p>
              <div
                style={{
                  border: `1px solid ${border}`,
                  borderRadius: 4,
                  padding: 16,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "#2d7d46",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ color: "#fff", fontSize: 22 }}>🌿</span>
                </div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  Green Key (FEE)
                </span>
              </div>
            </div>

            {/* Reviews */}
            <div ref={reviewsRef} style={{ marginBottom: 32 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <h3 style={{ fontSize: 20, fontWeight: 800 }}>Отзывы гостей</h3>
                <button
                  onClick={() => scrollToSection(availabilityRef, 1)}
                  style={{
                    background: blueLight,
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "8px 16px",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Посмотреть места
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    background: blue,
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 24,
                    padding: "10px 14px",
                    borderRadius: "4px 4px 4px 0",
                  }}
                >
                  {ratingText}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>
                    {hotel.ratingLabel || "Оценка гостей"}
                  </div>
                  <div style={{ fontSize: 13 }}>
                    {reviewsCountText} отзывов ·{" "}
                    <a href="#" style={{ color: blueLight }}>
                      Читать все отзывы
                    </a>
                  </div>
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>
                Категории:
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "8px 40px",
                  marginBottom: 16,
                }}
              >
                {ratingCats.map((cat, i) => (
                  <div key={i}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                        marginBottom: 3,
                      }}
                    >
                      <span>{cat.label}</span>
                      <span style={{ fontWeight: 700 }}>{cat.score}</span>
                    </div>
                    <div
                      style={{
                        height: 4,
                        background: "#e0e0e0",
                        borderRadius: 2,
                      }}
                    >
                      <div
                        style={{
                          width: `${(cat.score / 10) * 100}%`,
                          height: "100%",
                          background: blue,
                          borderRadius: 2,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Выберите темы:
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                {[
                  "Персонал",
                  "Номер",
                  "Расположение",
                  "Завтрак",
                  "Бассейн",
                ].map((t) => (
                  <button
                    key={t}
                    style={{
                      border: `1px solid ${border}`,
                      borderRadius: 20,
                      padding: "6px 14px",
                      fontSize: 13,
                      cursor: "pointer",
                      background: "#fff",
                    }}
                  >
                    + {t}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                Лучшие впечатления гостей
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                }}
              >
                {reviews.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      border: `1px solid ${border}`,
                      borderRadius: 4,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "#00a550",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {r.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          {r.name}
                        </div>
                        <div style={{ fontSize: 11, color: light }}>
                          {r.flag} {r.country}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, lineHeight: 1.6 }}>{r.text}</p>
                    <a
                      href="#"
                      style={{
                        color: blueLight,
                        fontSize: 12,
                        display: "block",
                        marginTop: 8,
                      }}
                    >
                      Подробнее
                    </a>
                  </div>
                ))}
              </div>
              <button
                style={{
                  border: `1px solid ${border}`,
                  background: "#fff",
                  borderRadius: 4,
                  padding: "8px 20px",
                  fontSize: 13,
                  cursor: "pointer",
                  marginTop: 14,
                }}
              >
                Читать все отзывы
              </button>
            </div>

            {/* Traveler questions */}
            <div style={{ marginBottom: 32 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <h3 style={{ fontSize: 20, fontWeight: 800 }}>
                  Вопросы от путешественников
                </h3>
                <button
                  onClick={() => scrollToSection(availabilityRef, 1)}
                  style={{
                    background: blueLight,
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "8px 16px",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Посмотреть места
                </button>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 4,
                }}
              >
                {travelerQuestions.slice(0, 9).map((q, i) => (
                  <div
                    key={i}
                    style={{
                      border: `1px solid ${border}`,
                      borderRadius: 4,
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#fff")
                    }
                  >
                    <span style={{ color: light, flexShrink: 0 }}>💬</span>
                    <span style={{ flex: 1, lineHeight: 1.4 }}>{q}</span>
                    <ChevronRight
                      size={13}
                      color={blueLight}
                      style={{ flexShrink: 0 }}
                    />
                  </div>
                ))}
                <div
                  style={{
                    border: `1px solid ${border}`,
                    borderRadius: 4,
                    padding: 16,
                    background: "#f9f9f9",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    Пока не нашли ответ на ваш вопрос?
                  </div>
                  <button
                    style={{
                      border: `1px solid ${blueLight}`,
                      color: blueLight,
                      background: "#fff",
                      borderRadius: 4,
                      padding: "6px 16px",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Задать вопрос
                  </button>
                  <div style={{ fontSize: 11, color: light }}>
                    У нас есть мгновенные ответы на большинство вопросов
                  </div>
                </div>
              </div>
              <button
                style={{
                  border: `1px solid ${border}`,
                  background: "#fff",
                  borderRadius: 4,
                  padding: "8px 20px",
                  fontSize: 13,
                  cursor: "pointer",
                  marginTop: 12,
                }}
              >
                Посмотреть другие вопросы (20)
              </button>
            </div>

            {/* Property company */}
            <div
              style={{
                marginBottom: 32,
                paddingTop: 24,
                borderTop: `1px solid ${border}`,
              }}
            >
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <img
                  src={PHOTOS[0]}
                  alt=""
                  style={{
                    width: 80,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 4,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div
                    style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}
                  >
                    Управляющая компания: {hotelName}
                  </div>
                  <div style={{ fontSize: 13, color: blueLight }}>
                    Оценка компании по отзывам: <strong>{propertyScore}</strong>{" "}
                    На основании {reviewsCountText} отзывов от 1 объекта
                    размещения
                  </div>
                  <div style={{ fontSize: 13, color: light, marginTop: 4 }}>
                    🏢 1 объект под управлением
                  </div>
                </div>
              </div>
              {propertySections.map((s, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div
                    style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}
                  >
                    {s.title}
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: "#333" }}>
                    {s.text}
                  </p>
                </div>
              ))}
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                  Здесь говорят на этих языках
                </div>
                <div style={{ fontSize: 13, color: light }}>
                  арабский, английский, хинди, филиппинский
                </div>
              </div>
            </div>

            {/* Nearby */}
            <div ref={policiesRef} style={{ marginBottom: 32 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <h3 style={{ fontSize: 20, fontWeight: 800 }}>
                  Ориентиры поблизости
                </h3>
                <button
                  onClick={() => scrollToSection(availabilityRef, 1)}
                  style={{
                    background: blueLight,
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "8px 16px",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Посмотреть места
                </button>
              </div>
              <div style={{ fontSize: 13, color: light, marginBottom: 10 }}>
                Гостям понравился этот район, так как он предлагает следующее:
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                {nearbyTags.map((t, i) => (
                  <a
                    key={i}
                    href="#"
                    style={{ color: blueLight, textDecoration: "none" }}
                  >
                    {t}
                  </a>
                ))}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 24,
                  fontSize: 13,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 10 }}>
                    🏛 Главные достопримечательности
                  </div>
                  {nearby.attractions.map((a, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "5px 0",
                        borderBottom: `1px solid ${border}`,
                      }}
                    >
                      <span>{a.name}</span>
                      <span style={{ color: light }}>{a.dist}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 10 }}>
                    🍽 Рестораны и кафе
                  </div>
                  {nearby.restaurants.map((a, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "5px 0",
                        borderBottom: `1px solid ${border}`,
                      }}
                    >
                      <span style={{ flex: 1, marginRight: 8 }}>{a.name}</span>
                      <span style={{ color: light, whiteSpace: "nowrap" }}>
                        {a.dist}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{ fontWeight: 700, marginTop: 14, marginBottom: 10 }}
                  >
                    🏖 Пляжи в окрестностях
                  </div>
                  {nearby.beaches.map((a, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "5px 0",
                        borderBottom: `1px solid ${border}`,
                      }}
                    >
                      <span>{a.name}</span>
                      <span style={{ color: light }}>{a.dist}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 10 }}>
                    🚌 Общественный транспорт
                  </div>
                  {nearby.transport.map((a, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "5px 0",
                        borderBottom: `1px solid ${border}`,
                      }}
                    >
                      <span style={{ flex: 1, marginRight: 8 }}>{a.name}</span>
                      <span style={{ color: light, whiteSpace: "nowrap" }}>
                        {a.dist}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{ fontWeight: 700, marginTop: 14, marginBottom: 10 }}
                  >
                    ✈️ Ближайшие аэропорты
                  </div>
                  {nearby.airports.map((a, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "5px 0",
                        borderBottom: `1px solid ${border}`,
                      }}
                    >
                      <span style={{ flex: 1, marginRight: 8 }}>{a.name}</span>
                      <span style={{ color: light, whiteSpace: "nowrap" }}>
                        {a.dist}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* House rules */}
            <div style={{ marginBottom: 32 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <h3 style={{ fontSize: 20, fontWeight: 800 }}>
                  Условия размещения
                </h3>
                <button
                  style={{
                    background: blueLight,
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "8px 16px",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Посмотреть места
                </button>
              </div>
              <p style={{ fontSize: 13, color: light, marginBottom: 16 }}>
                {hotelName} принимает особые пожелания — добавьте их на
                следующем шаге
              </p>
              {[
                {
                  icon: "→",
                  label: "Заезд",
                  val: "С 14:00\nПожалуйста, сообщите администрации заранее, во сколько вы приедете.",
                },
                { icon: "←", label: "Отъезд", val: "До 12:00" },
                {
                  icon: "ℹ️",
                  label: "Отмена/ предоплата",
                  val: "Правила отмены бронирования и предоплаты отличаются в зависимости от варианта размещения.",
                },
                {
                  icon: "🛏",
                  label: "Кровати для детей",
                  val: "Разрешается проживание детей любого возраста.\n\nОт 0 до 3 лет — детская кроватка по запросу: Бесплатно\nОт 4 лет — дополнительная кровать по запросу: AED 100 за человека за ночь",
                },
                {
                  icon: "🔞",
                  label: "Возрастное ограничение",
                  val: "Минимальный допустимый возраст для заезда: 18 лет",
                },
                {
                  icon: "💳",
                  label: "Принимаемые способы оплаты",
                  val: "Visa · Mastercard · American Express · Diners · JCB · UnionPay · Наличные",
                },
                {
                  icon: "🎉",
                  label: "Вечеринки",
                  val: "Нельзя проводить вечеринки/мероприятия.",
                },
                {
                  icon: "🐾",
                  label: "Домашние животные",
                  val: "Размещение с домашними животными не допускается.",
                },
              ].map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 24,
                    padding: "14px 0",
                    borderTop: `1px solid ${border}`,
                    fontSize: 13,
                  }}
                >
                  <div
                    style={{
                      width: 180,
                      flexShrink: 0,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 6,
                    }}
                  >
                    <span>{row.icon}</span>
                    {row.label}
                  </div>
                  <div style={{ lineHeight: 1.7, whiteSpace: "pre-line" }}>
                    {row.val}
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>
                {hotelName}: часто задаваемые вопросы
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                {faq.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      border: `1px solid ${border}`,
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => toggleFaq(i)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 16px",
                        background: "#fff",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          lineHeight: 1.4,
                        }}
                      >
                        {item.q}
                      </span>
                      {openFaq[i] ? (
                        <ChevronUp size={16} color="#888" />
                      ) : (
                        <ChevronDown size={16} color="#888" />
                      )}
                    </button>
                    {openFaq[i] && (
                      <div
                        style={{
                          padding: "12px 16px 14px",
                          fontSize: 13,
                          lineHeight: 1.7,
                          borderTop: `1px solid ${border}`,
                          whiteSpace: "pre-line",
                          color: "#333",
                        }}
                      >
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Loyalty sidebar */}
          <div style={{ width: 280, flexShrink: 0 }}>
            <div style={{ position: "sticky", top: 80 }}>
              <div
                style={{
                  border: `1px solid ${border}`,
                  borderRadius: 4,
                  padding: 16,
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>
                  {hotel.genius
                    ? "Ваши Genius-вознаграждения 1-го уровня"
                    : "Преимущества бронирования"}
                </div>
                <div style={{ fontSize: 13, color: light, marginBottom: 10 }}>
                  {hotel.genius
                    ? "Доступно для ряда вариантов:"
                    : "Что стоит знать перед бронированием:"}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6,
                    fontSize: 13,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      color: "#f5a623",
                      fontSize: 14,
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    ●
                  </span>
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {hotel.genius ? "Скидка 13%" : "Гибкие тарифы"}
                    </div>
                    <div style={{ color: light, fontSize: 12 }}>
                      {hotel.genius
                        ? "Применяется к цене без учёта налогов и сборов."
                        : hotel.freeCancel
                          ? "Для части вариантов доступна бесплатная отмена."
                          : "Проверьте условия тарифа и оплаты перед подтверждением."}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    borderTop: `1px solid ${border}`,
                    paddingTop: 10,
                    marginTop: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: light }}>
                    Программа лояльности Booking.com
                  </span>
                  <span
                    style={{ color: blueLight, fontWeight: 800, fontSize: 16 }}
                  >
                    {hotel.genius ? "Genius" : hotel.ratingLabel || "Booking"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
