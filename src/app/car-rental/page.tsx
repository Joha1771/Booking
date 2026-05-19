"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Car,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  SearchX,
} from "lucide-react";
import GeniusSection from "../../components/sections/GeniusSection.tsx";

const TIMES = [
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

const GENIUS_BENEFITS = [
  {
    icon: "%",
    title: "Скидки 10% на жильё",
    desc: "Экономьте на вариантах жилья по всему миру, участвующих в программе.",
    locked: false,
  },
  {
    icon: "🚗",
    title: "Скидка 10% на аренду автомобилей",
    desc: "Сэкономьте на аренде некоторых автомобилей",
    locked: false,
  },
  {
    icon: "🔒",
    title: "Скидки 10–15% на жильё",
    desc: "Завершите 5 бронирований, чтобы получить статус Genius 2-го уровня.",
    locked: true,
  },
  {
    icon: "🔒",
    title: "Скидки 10–15% на аренду автомобилей",
    desc: "Завершите 5 бронирований, чтобы получить статус Genius 2-го уровня.",
    locked: true,
  },
  {
    icon: "🔒",
    title: "Бесплатный завтрак",
    desc: "Завершите 5 бронирований, чтобы получить статус Genius 2-го уровня.",
    locked: true,
  },
  {
    icon: "🔒",
    title: "Бесплатное повышение категории номера",
    desc: "Завершите 5 бронирований, чтобы получить статус Genius 2-го уровня.",
    locked: true,
  },
  {
    icon: "🔒",
    title: "Поздний выезд",
    desc: "Завершите 5 бронирований, чтобы получить статус Genius 2-го уровня.",
    locked: true,
  },
];

const USP = [
  {
    title: "Мы всегда готовы помочь",
    desc: "Наша служба поддержки работает более чем на 30 языках.",
    icon: "https://t-cf.bstatic.com/design-assets/assets/v3.188.0/illustrations-traveller/CustomerService.webp",
    icon2x:
      "https://t-cf.bstatic.com/design-assets/assets/v3.188.0/illustrations-traveller/CustomerService@2x.webp",
  },
  {
    title: "Бесплатная отмена",
    desc: "Действует для большинства бронирований, если до получения не меньше 48 часов.",
    icon: "https://t-cf.bstatic.com/design-assets/assets/v3.188.0/illustrations-traveller/FreeCancellation.webp",
    icon2x:
      "https://t-cf.bstatic.com/design-assets/assets/v3.188.0/illustrations-traveller/FreeCancellation@2x.webp",
  },
  {
    title: "Более 5 млн отзывов",
    desc: "Проверенные отзывы от реальных клиентов.",
    icon: "https://t-cf.bstatic.com/design-assets/assets/v3.188.0/illustrations-traveller/Reviews.webp",
    icon2x:
      "https://t-cf.bstatic.com/design-assets/assets/v3.188.0/illustrations-traveller/Reviews@2x.webp",
  },
];

const RENTAL_PARTNERS = [
  { name: "Europcar", bg: "#04a61f", color: "#fff", delay: "0s" },
  { name: "enterprise", bg: "#2f8f57", color: "#fff", delay: "0.1s" },
  { name: "keddy", bg: "#5a18bf", color: "#fff", delay: "0.2s" },
  { name: "dollar", bg: "#ef233c", color: "#fff", delay: "0.3s" },
  { name: "GOLDCAR", bg: "#d4db22", color: "#161616", delay: "0.4s" },
  { name: "AVIS", bg: "#ffffff", color: "#d62828", delay: "0.5s" },
  { name: "SIXT", bg: "#ff5a1f", color: "#111827", delay: "0.6s" },
  { name: "Hertz", bg: "#ffffff", color: "#111827", delay: "0.7s" },
];

function formatCarDate(value) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

const FAQ = [
  {
    q: "Почему стоит забронировать аренду автомобиля в Узбекистане на Booking.com?",
    a: "Мы помогаем найти именно тот автомобиль, который вам нужен.\n\n• У нас доступен широкий ассортимент — от компактных автомобилей до внедорожников.\n\n• Служба поддержки работает более чем на 30 языках.\n\n• Большинство бронирований можно бесплатно отменить вплоть до 48 часов до начала аренды.",
  },
  {
    q: "Что нужно, чтобы взять автомобиль в аренду?",
    a: "При бронировании автомобиля вам понадобится только кредитная или дебетовая карта.\n\nВ пункте проката вам потребуются:\n\n• Паспорт.\n\n• Ваучер.\n\n• Водительское удостоверение для каждого из водителей.\n\n• Кредитная карта на имя главного водителя.",
  },
  {
    q: "С какого возраста можно брать автомобили в аренду?",
    a: "Минимальный возраст для аренды автомобиля обычно составляет 21 год, хотя некоторые прокатные компании принимают водителей от 18 лет.",
  },
  {
    q: "Могу ли я арендовать автомобиль для своего партнёра, друга или коллеги?",
    a: "Конечно. Просто введите во время бронирования данные другого человека в разделе «Информация о водителе».",
  },
  {
    q: "Какие есть советы по выбору автомобиля?",
    a: "Подумайте о том, куда вы едете. Для поездки по Риму подойдёт автомобиль поменьше.\n\nУзнайте, что думают другие. На нашем сайте много отзывов и оценок.",
  },
  {
    q: "Все ли включено в стоимость аренды?",
    a: "В стоимость входит автомобиль, обязательные страховые покрытия (CDW) и возможные сборы, которые обычно оплачиваются при получении.\n\nТакже включены добавленные вами дополнительные услуги (GPS, детское автокресло).",
  },
];

export default function CarRentalPage() {
  const [pickupLocation, setPickupLocation] = useState(
    "Islam Karimov Tashkent International Airport (TAS), Tashken...",
  );
  const [pickupDate, setPickupDate] = useState("2026-05-17");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnDate, setReturnDate] = useState("2026-05-20");
  const [returnTime, setReturnTime] = useState("10:00");
  const [diffReturn, setDiffReturn] = useState(false);
  const [ageCheck, setAgeCheck] = useState(true);
  const [searched, setSearched] = useState(false);
  const [searchStage, setSearchStage] = useState("idle");
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    if (searchStage !== "loading") return undefined;

    const timeoutId = window.setTimeout(() => {
      setSearchStage("empty");
    }, 2300);

    return () => window.clearTimeout(timeoutId);
  }, [searchStage]);

  const handleSearch = () => {
    setSearched(true);
    setSearchStage("loading");
  };

  const searchBar = (
    <div
      style={{
        background: "#febb02",
        borderRadius: 4,
        padding: 4,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
      }}
    >
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        <div
          className="page-hero-field-grow"
          style={{
            background: "#fff",
            borderRadius: 2,
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Car size={18} color="#555" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Место получения</div>
            <input
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: 13,
                fontWeight: 600,
                width: "100%",
              }}
            />
          </div>
          {pickupLocation && (
            <button
              onClick={() => setPickupLocation("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#888",
                fontSize: 18,
                padding: 0,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          )}
        </div>

        <div
          className="page-hero-field-md"
          style={{
            background: "#fff",
            borderRadius: 2,
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Calendar size={16} color="#555" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 11, color: "#888" }}>Дата получения</div>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: "transparent",
              }}
            />
          </div>
        </div>

        <div
          className="page-hero-field-sm"
          style={{
            background: "#fff",
            borderRadius: 2,
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Clock size={16} color="#555" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 11, color: "#888" }}>Время</div>
            <select
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: "transparent",
              }}
            >
              {TIMES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="page-hero-field-md"
          style={{
            background: "#fff",
            borderRadius: 2,
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Calendar size={16} color="#555" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 11, color: "#888" }}>Дата возврата</div>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: "transparent",
              }}
            />
          </div>
        </div>

        <div
          className="page-hero-field-sm"
          style={{
            background: "#fff",
            borderRadius: 2,
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Clock size={16} color="#555" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 11, color: "#888" }}>Время</div>
            <select
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: "transparent",
              }}
            >
              {TIMES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSearch}
          className="page-hero-submit"
          style={{
            background: "#0071c2",
            color: "#fff",
            border: "none",
            borderRadius: 2,
            padding: "0 32px",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
            minHeight: 48,
          }}
        >
          {searchStage === "loading" ? "Ищем..." : "Поиск"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 4px 4px",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              fontSize: 13,
              color: "#333",
            }}
          >
            <input
              type="checkbox"
              checked={diffReturn}
              onChange={(e) => setDiffReturn(e.target.checked)}
            />
            Разные места получения и возврата
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              fontSize: 13,
              color: "#333",
            }}
          >
            <input
              type="checkbox"
              checked={ageCheck}
              onChange={(e) => setAgeCheck(e.target.checked)}
              style={{ accentColor: "#0071c2" }}
            />
            Водитель от 30 до 65 лет
          </label>
        </div>
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            color: "#333",
            fontWeight: 600,
          }}
        >
          <SlidersHorizontal size={14} /> Быстрые фильтры
        </button>
      </div>
    </div>
  );

  const landingContent = (
    <>
      <div
        style={{
          background: "var(--booking-blue, #003580)",
          paddingTop: 40,
          paddingBottom: 0,
        }}
      >
        <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
          <h1
            style={{
              color: "#fff",
              fontSize: 40,
              fontWeight: 800,
              marginBottom: 8,
              lineHeight: 1.15,
            }}
          >
            Аренда автомобилей для любой поездки
          </h1>
          <p
            style={{
              color: "#fff",
              fontSize: 16,
              marginBottom: 28,
              opacity: 0.9,
            }}
          >
            Автомобили крупнейших прокатных компаний по отличным ценам.
          </p>

          <div
            style={{
              transform: "translateY(70%)",
              position: "relative",
              zIndex: 10,
            }}
          >
            {searchBar}
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", paddingTop: 100 }}>
        <GeniusSection />

        <div
          style={{
            background: "#f5f5f5",
            padding: "28px 0",
            borderTop: "1px solid #e7e7e7",
            borderBottom: "1px solid #e7e7e7",
          }}
        >
          <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
            <div
              style={{
                display: "flex",
                gap: 28,
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              {USP.map((u, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    flex: "1 1 300px",
                    minWidth: 260,
                  }}
                >
                  <div
                    style={{
                      width: 96,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={u.icon}
                      srcSet={`${u.icon2x} 2x`}
                      alt=""
                      loading="lazy"
                      style={{ width: 80, height: 80, objectFit: "contain" }}
                    />
                  </div>
                  <div>
                    <div
                      style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}
                    >
                      {u.title}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#595959",
                        lineHeight: 1.45,
                      }}
                    >
                      {u.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", padding: "48px 0" }}>
          <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
              Часто задаваемые вопросы
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 0,
              }}
            >
              {FAQ.map((item, i) => (
                <div
                  key={i}
                  style={{
                    borderBottom: "1px solid #e7e7e7",
                    borderRight: i % 2 === 0 ? "1px solid #e7e7e7" : "none",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 20px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      gap: 12,
                    }}
                  >
                    <span
                      style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}
                    >
                      {item.q}
                    </span>
                    {openFaq === i ? (
                      <ChevronUp
                        size={18}
                        color="#595959"
                        style={{ flexShrink: 0 }}
                      />
                    ) : (
                      <ChevronDown
                        size={18}
                        color="#595959"
                        style={{ flexShrink: 0 }}
                      />
                    )}
                  </button>
                  {openFaq === i && (
                    <div
                      style={{
                        padding: "0 20px 16px",
                        fontSize: 13,
                        color: "#333",
                        lineHeight: 1.6,
                        whiteSpace: "pre-line",
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
      </div>
    </>
  );

  const resultsContent = (
    <>
      <style>{`
        @keyframes carRentalSpinner {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes carRentalPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.98); opacity: 0.9; }
        }
      `}</style>

      <div
        style={{
          background: "var(--booking-blue, #003580)",
          paddingTop: 32,
          paddingBottom: 0,
        }}
      >
        <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
          <div
            style={{
              color: "#fff",
              marginBottom: 8,
              fontSize: 14,
              opacity: 0.95,
            }}
          >
            Результаты поиска аренды автомобилей
          </div>
          <h1
            style={{
              color: "#fff",
              fontSize: 32,
              fontWeight: 800,
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            {pickupLocation}
          </h1>
          <p style={{ color: "#fff", opacity: 0.9, marginBottom: 24 }}>
            {formatCarDate(pickupDate)} {pickupTime} —{" "}
            {formatCarDate(returnDate)} {returnTime}
          </p>

          <div
            style={{
              transform: "translateY(60%)",
              position: "relative",
              zIndex: 10,
            }}
          >
            {searchBar}
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", paddingTop: 92, paddingBottom: 48 }}>
        <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
          {searchStage === "loading" ? (
            <div
              style={{
                minHeight: 470,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 0 24px",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#111827",
                  marginBottom: 28,
                  textAlign: "center",
                }}
              >
                Ищем лучшие предложения от известных компаний
              </div>

              <div
                style={{
                  width: "100%",
                  maxWidth: 720,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: "34px 52px",
                  justifyItems: "center",
                }}
              >
                {RENTAL_PARTNERS.map((partner) => (
                  <div
                    key={partner.name}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 10,
                      animation: "carRentalPulse 1.8s ease-in-out infinite",
                      animationDelay: partner.delay,
                    }}
                  >
                    <div
                      style={{
                        width: 72,
                        height: 36,
                        borderRadius: 0,
                        background: partner.bg,
                        color: partner.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: partner.name === "enterprise" ? 13 : 14,
                        letterSpacing: partner.name === "AVIS" ? 0.2 : 0,
                        boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
                        border:
                          partner.bg === "#ffffff"
                            ? "1px solid #e5e7eb"
                            : "1px solid transparent",
                      }}
                    >
                      {partner.name}
                    </div>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        border: "3px solid #dbeafe",
                        borderTopColor: "#0a6cff",
                        animation: "carRentalSpinner 0.85s linear infinite",
                        animationDelay: partner.delay,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                minHeight: 470,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "28px 0 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 150,
                  height: 112,
                  borderRadius: 22,
                  background:
                    "linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)",
                  border: "1px solid #fde7c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 28,
                }}
              >
                <div style={{ position: "relative", width: 100, height: 64 }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 20,
                      right: 20,
                      top: 12,
                      height: 12,
                      borderRadius: 999,
                      background: "#dbeafe",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 16,
                      right: 16,
                      top: 20,
                      height: 24,
                      borderRadius: 8,
                      border: "4px solid #fb923c",
                      background:
                        "repeating-linear-gradient(135deg, #fdba74 0 8px, #fff7ed 8px 16px)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 10,
                      bottom: 4,
                      width: 16,
                      height: 24,
                      background: "#14b8a6",
                      borderRadius: 999,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: 10,
                      bottom: 4,
                      width: 16,
                      height: 24,
                      background: "#14b8a6",
                      borderRadius: 999,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      bottom: 0,
                      width: 18,
                      height: 18,
                      borderLeft: "10px solid transparent",
                      borderRight: "10px solid transparent",
                      borderBottom: "26px solid #fb923c",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      bottom: 0,
                      width: 18,
                      height: 18,
                      borderLeft: "10px solid transparent",
                      borderRight: "10px solid transparent",
                      borderBottom: "26px solid #fb923c",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: 6,
                      top: 0,
                      color: "#ea580c",
                      fontSize: 28,
                      fontWeight: 800,
                      lineHeight: 1,
                    }}
                  >
                    !
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#111827",
                  marginBottom: 10,
                  maxWidth: 760,
                }}
              >
                Мы не нашли автомобили, соответствующие вашим критериям поиска
              </div>

              <div
                style={{
                  fontSize: 16,
                  color: "#4b5563",
                  marginBottom: 22,
                }}
              >
                Попробуйте изменить поисковый запрос.
              </div>

              <button
                type="button"
                onClick={handleSearch}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1px solid #0071c2",
                  background: "#fff",
                  color: "#0071c2",
                  borderRadius: 8,
                  padding: "11px 16px",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                <SearchX size={16} /> Повторить поиск
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      }}
    >
      <Header />
      {searched ? resultsContent : landingContent}

      <Footer />
    </div>
  );
}
