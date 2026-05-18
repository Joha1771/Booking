"use client";

import { useState, useRef, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  ArrowLeftRight,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import GeniusSection from "@/components/sections/GeniusSection";

const TAXI_SUGGESTIONS = [
  "Международный аэропорт Ислама Каримова (TAS), Ташкент",
  "Ташкент — центр города",
  "Самарканд — центр",
  "Бухара — центр",
  "Навои — центр",
  "Андижан — центр",
  "Фергана — центр",
  "Аэропорт Самарканд (SKD)",
  "Аэропорт Бухара (BHK)",
  "Аэропорт Наманган (NMA)",
];

function TaxiInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const filtered =
    value.length > 0
      ? TAXI_SUGGESTIONS.filter((s) =>
          s.toLowerCase().includes(value.toLowerCase()),
        ).slice(0, 6)
      : TAXI_SUGGESTIONS.slice(0, 6);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        flex: "1 1 220px",
        minWidth: 0,
        background: "#fff",
        borderRadius: 2,
        padding: "10px 12px",
        position: "relative",
      }}
    >
      <div style={{ fontSize: 11, color: "#888" }}>{label}</div>
      <input
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || ""}
        style={{
          border: "none",
          outline: "none",
          fontSize: 13,
          fontWeight: 600,
          width: "100%",
          background: "transparent",
        }}
      />
      {open && filtered.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 200,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
            width: "100%",
            maxWidth: 360,
            overflow: "hidden",
            marginTop: 4,
          }}
        >
          {filtered.map((s, i) => (
            <div
              key={i}
              onMouseDown={() => {
                onChange(s);
                setOpen(false);
              }}
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                fontSize: 13,
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f5f7ff")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <span style={{ fontSize: 18 }}>✈️</span>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
    desc: "Сэкономьте на аренде некоторых автомобилей.",
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
    emoji: "✈️",
    title: "Отслеживание рейса",
    desc: "Водитель будет следить за вашим рейсом и подождёт, если самолёт задержится",
  },
  {
    emoji: "💰",
    title: "Цена со всеми сборами",
    desc: "Вы видите итоговую цену — никаких других расходов и доплат наличными",
  },
  {
    emoji: "🧑",
    title: "Надёжность",
    desc: "Мы работаем с профессиональными водителями и оказываем клиентам поддержку в любое время",
  },
];

const HOW_IT_WORKS = [
  { icon: "🚕", label: "Бронирование\nонлайн" },
  { icon: "📱", label: "Получение\nподтверждения" },
  { icon: "🏨", label: "Поездка до места\nпроживания" },
  { icon: "🧑‍✈️", label: "Встреча с\nводителем" },
];

const BENEFITS = [
  {
    icon: "🚗",
    title: "Бронирование такси",
    desc: "Бронирование подтверждается мгновенно. Если планы поменяются, вы сможете бесплатно его отменить вплоть до 24 часов до подачи автомобиля",
  },
  {
    icon: "🧑‍✈️",
    title: "Встреча с водителем",
    desc: "Вас встретят в аэропорту по прилёте и сопроводят до автомобиля. Водитель будет отслеживать ваш рейс и дождётся вас, даже если ваш самолёт задержится",
  },
  {
    icon: "🏨",
    title: "Дорога до места проживания",
    desc: "Вас быстро и безопасно доставят до места проживания — не нужно ждать в очереди на такси и искать подходящий общественный транспорт",
  },
];

const CAR_TYPES = [
  {
    tab: "1–3 пассажира",
    cars: [
      {
        name: "Стандартный автомобиль",
        sub: "Skoda Octavia или похожий",
        passengers: 3,
        bags: 2,
        greeting: true,
        cancel: true,
      },
      {
        name: "Представительский автомобиль",
        sub: "Mercedes-Benz E-класса или похожий",
        passengers: 3,
        bags: 2,
        greeting: true,
        cancel: true,
      },
    ],
  },
  {
    tab: "4–7 пассажиров",
    cars: [
      {
        name: "Минивэн",
        sub: "VW Touran или похожий",
        passengers: 7,
        bags: 4,
        greeting: true,
        cancel: true,
      },
    ],
  },
  {
    tab: "Все такси",
    cars: [] as {
      name: string;
      sub: string;
      passengers: number;
      bags: number;
      greeting: boolean;
      cancel: boolean;
    }[],
  },
];

const FAQ = [
  {
    q: "Что если мой самолёт приземлится не по расписанию?",
    a: "Водитель отслеживает ваш рейс в реальном времени и дождётся вас, если самолёт задержится. Доплата за ожидание не взимается.",
  },
  {
    q: "Как производится оплата?",
    a: "Оплата производится онлайн при бронировании. Принимаются банковские карты. Никаких доплат наличными.",
  },
  {
    q: "Что входит в цену?",
    a: "В цену включены: встреча в аэропорту, поездка до места проживания, отслеживание рейса и бесплатное ожидание до 60 минут.",
  },
  {
    q: "Можно ли отменить бронирование?",
    a: "Да, бесплатная отмена доступна вплоть до 24 часов до подачи автомобиля.",
  },
];

const TAXI_RESULTS = [
  {
    name: "Стандартный",
    sub: "Skoda Octavia или похожий",
    passengers: 3,
    bags: 2,
    duration: "~25 мин",
    price: 80000,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400",
    provider: "Yandex Taxi",
    rating: 8.8,
    features: [
      "Встреча в аэропорту",
      "Бесплатная отмена",
      "Отслеживание рейса",
    ],
  },
  {
    name: "Комфорт",
    sub: "Toyota Camry или похожий",
    passengers: 3,
    bags: 2,
    duration: "~25 мин",
    price: 130000,
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400",
    provider: "Comfort Taxi",
    rating: 9.0,
    features: ["Встреча в аэропорту", "Бесплатная отмена", "Вода в подарок"],
  },
  {
    name: "Бизнес-класс",
    sub: "Mercedes-Benz E-класса или похожий",
    passengers: 3,
    bags: 2,
    duration: "~20 мин",
    price: 250000,
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400",
    provider: "Premium Taxi",
    rating: 9.2,
    features: ["Встреча в аэропорту", "Бесплатная отмена", "Wi-Fi, вода"],
  },
  {
    name: "Минивэн",
    sub: "VW Touran или похожий",
    passengers: 7,
    bags: 5,
    duration: "~30 мин",
    price: 160000,
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400",
    provider: "Van Transfer",
    rating: 8.6,
    features: ["До 7 пассажиров", "Бесплатная отмена", "Большой багажник"],
  },
];

export default function TaxiPage() {
  const [direction, setDirection] = useState("one");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("2026-05-21");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState(2);
  const [activeCarTab, setActiveCarTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [geniusPage, setGeniusPage] = useState(0);
  const [searched, setSearched] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  function handleSearch() {
    setSearched(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      }}
    >
      <Header />

      <div style={{ background: "#003580", paddingBottom: 48 }}>
        <div
          style={{ maxWidth: 1150, margin: "0 auto", padding: "40px 16px 0" }}
        >
          <h1
            style={{
              color: "#fff",
              fontSize: 36,
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            Забронируйте такси от/до аэропорта
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 15,
              marginBottom: 20,
            }}
          >
            Удобный заказ трансфера до места проживания и обратно в аэропорт
          </p>

          <div
            style={{
              display: "flex",
              gap: 20,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            {[
              { v: "one", label: "В одну сторону" },
              { v: "round", label: "Туда и обратно" },
            ].map((opt) => (
              <label
                key={opt.v}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                <input
                  type="radio"
                  name="direction"
                  value={opt.v}
                  checked={direction === opt.v}
                  onChange={() => setDirection(opt.v)}
                  style={{ accentColor: "#fff", width: 16, height: 16 }}
                />
                {opt.label}
              </label>
            ))}
          </div>

          <div className="page-hero-form">
            <TaxiInput label="Место подачи" value={from} onChange={setFrom} />

            <div
              className="page-hero-field-sm"
              style={{
                background: "#fff",
                borderRadius: 2,
                padding: "0 10px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ArrowLeftRight size={16} color="#888" />
            </div>

            <TaxiInput label="Место назначения" value={to} onChange={setTo} />

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
              <Calendar size={15} color="#555" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, color: "#888" }}>Дата</div>
                <input
                  type="date"
                  value={date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setDate(e.target.value)
                  }
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
              className="page-hero-field-md"
              style={{
                background: "#fff",
                borderRadius: 2,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: direction === "round" ? 1 : 0.5,
              }}
            >
              <Calendar size={15} color="#555" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, color: "#888" }}>
                  Добавить поездку обратно
                </div>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setReturnDate(e.target.value)
                  }
                  disabled={direction !== "round"}
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: direction === "round" ? "pointer" : "default",
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
                gap: 6,
              }}
            >
              <Users size={15} color="#555" style={{ flexShrink: 0 }} />
              <select
                value={passengers}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setPassengers(Number(e.target.value))
                }
                style={{
                  border: "none",
                  outline: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: "transparent",
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <button
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
                minHeight: 48,
              }}
            >
              Найти
            </button>
          </div>
        </div>
      </div>

      {searched && (
        <div
          ref={resultsRef}
          style={{
            background: "#f5f7ff",
            borderBottom: "1px solid #e7e7e7",
            padding: "32px 0",
          }}
        >
          <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              {from || "Откуда"} → {to || "Куда"}
            </h2>
            <div style={{ fontSize: 13, color: "#6b6b6b", marginBottom: 20 }}>
              {date} · {passengers} пассажир
              {passengers > 1 ? (passengers > 4 ? "ов" : "а") : ""}
              {direction === "round" && returnDate
                ? ` · Обратно: ${returnDate}`
                : ""}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {TAXI_RESULTS.filter((r) => r.passengers >= passengers).map(
                (r, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#fff",
                      border: "1px solid #e7e7e7",
                      borderRadius: 8,
                      overflow: "hidden",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                    }}
                  >
                    <div className="page-results-card-row">
                      <img
                        src={r.image}
                        alt={r.name}
                        className="page-results-card-media"
                        style={{
                          width: "100%",
                          maxWidth: 180,
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                      <div
                        style={{
                          flex: 1,
                          padding: "20px 24px",
                          display: "flex",
                          gap: 24,
                          alignItems: "center",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 17,
                              fontWeight: 700,
                              marginBottom: 2,
                            }}
                          >
                            {r.name}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#6b6b6b",
                              marginBottom: 8,
                            }}
                          >
                            {r.sub}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 16,
                              fontSize: 13,
                              color: "#444",
                              marginBottom: 10,
                            }}
                          >
                            <span>👤 {r.passengers} пасс.</span>
                            <span>🧳 {r.bags} мест</span>
                            <span>⏱ {r.duration}</span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            {r.features.map((f, fi) => (
                              <span
                                key={fi}
                                style={{
                                  background: "#e8f4ff",
                                  color: "#0071c2",
                                  borderRadius: 20,
                                  padding: "3px 10px",
                                  fontSize: 12,
                                  fontWeight: 500,
                                }}
                              >
                                ✓ {f}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="page-results-card-summary">
                          <div
                            style={{
                              fontSize: 12,
                              color: "#6b6b6b",
                              marginBottom: 2,
                            }}
                          >
                            {r.provider}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              gap: 6,
                              marginBottom: 8,
                            }}
                          >
                            <span
                              style={{
                                background: "#003580",
                                color: "#fff",
                                borderRadius: 4,
                                padding: "2px 7px",
                                fontSize: 13,
                                fontWeight: 700,
                              }}
                            >
                              {r.rating}
                            </span>
                            <span style={{ fontSize: 12, color: "#6b6b6b" }}>
                              Отлично
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: 22,
                              fontWeight: 800,
                              color: "#111",
                              marginBottom: 4,
                            }}
                          >
                            {r.price.toLocaleString("ru")} UZS
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#6b6b6b",
                              marginBottom: 12,
                            }}
                          >
                            Включая все сборы
                          </div>
                          <button
                            style={{
                              background: "#0071c2",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              padding: "10px 24px",
                              fontSize: 14,
                              fontWeight: 700,
                              cursor: "pointer",
                              width: "100%",
                            }}
                          >
                            Забронировать
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          background: "#f5f5f5",
          borderBottom: "1px solid #e7e7e7",
          padding: "32px 0",
        }}
      >
        <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
          <div
            style={{
              display: "flex",
              gap: 48,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {USP.map((u, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  maxWidth: 280,
                }}
              >
                <div style={{ fontSize: 40, flexShrink: 0 }}>{u.emoji}</div>
                <div>
                  <div
                    style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}
                  >
                    {u.title}
                  </div>
                  <div
                    style={{ fontSize: 13, color: "#595959", lineHeight: 1.4 }}
                  >
                    {u.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <GeniusSection />
      <div
        style={{
          padding: "48px 0",
          background: "#fff",
          borderBottom: "1px solid #e7e7e7",
        }}
      >
        <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              textAlign: "center",
              marginBottom: 40,
            }}
          >
            Удобный трансфер от/до аэропорта
          </h2>
          <div
            style={{
              display: "flex",
              gap: 48,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 260 }}>
              {BENEFITS.map((b, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 16, marginBottom: 28 }}
                >
                  <div style={{ fontSize: 36, flexShrink: 0 }}>{b.icon}</div>
                  <div>
                    <div
                      style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}
                    >
                      {b.title}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#595959",
                        lineHeight: 1.5,
                      }}
                    >
                      {b.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ flex: 1, minWidth: 260 }}>
              <div
                style={{
                  fontSize: 13,
                  color: "#0071c2",
                  fontWeight: 600,
                  marginBottom: 20,
                }}
              >
                Как это работает?
              </div>
              <div className="page-two-col-grid" style={{ gap: 24 }}>
                {HOW_IT_WORKS.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        background: "#e8f0fe",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 28,
                      }}
                    >
                      {step.icon}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#333",
                        textAlign: "center",
                        whiteSpace: "pre-line",
                        lineHeight: 1.4,
                      }}
                    >
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 20,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    background: "#0a8f43",
                    borderRadius: "50%",
                  }}
                />
                <span style={{ fontSize: 13, color: "#333" }}>
                  Хорошего путешествия!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "48px 0",
          background: "#f5f5f5",
          borderBottom: "1px solid #e7e7e7",
        }}
      >
        <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
            Такси из аэропорта для любой поездки
          </h2>

          <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
            {CAR_TYPES.map((t, i) => (
              <button
                key={i}
                onClick={() => setActiveCarTab(i)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  border: "1px solid #e7e7e7",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  background: activeCarTab === i ? "#003580" : "#fff",
                  color: activeCarTab === i ? "#fff" : "#333",
                }}
              >
                {t.tab}
              </button>
            ))}
          </div>

          <div className="page-two-col-grid">
            {(activeCarTab === 2
              ? CAR_TYPES.flatMap((t) => t.cars)
              : CAR_TYPES[activeCarTab].cars
            ).map((car, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: "1px solid #e7e7e7",
                  borderRadius: 8,
                  padding: 20,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.1)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>
                  {car.name}
                </div>
                <div
                  style={{ fontSize: 13, color: "#595959", marginBottom: 12 }}
                >
                  {car.sub}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    fontSize: 13,
                    color: "#333",
                    marginBottom: 8,
                  }}
                >
                  <span>👤 {car.passengers} пассажира</span>
                  <span>🧳 {car.bags} стандартные сумки</span>
                </div>
                {car.greeting && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      color: "#0a8f43",
                      marginBottom: 4,
                    }}
                  >
                    <Check size={14} /> Сервис встречи включён
                  </div>
                )}
                {car.cancel && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      color: "#333",
                    }}
                  >
                    <Check size={14} color="#555" /> Бесплатная отмена
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "48px 0", background: "#fff" }}>
        <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            Узнайте больше о нашей службе такси от/до аэропорта
          </h2>
          <p style={{ fontSize: 14, color: "#595959", marginBottom: 24 }}>
            Найдите ответы на другие вопросы на нашей{" "}
            <a href="#" style={{ color: "#0071c2" }}>
              странице помощи
            </a>
          </p>
          <div className="page-faq-grid">
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
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
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

      <Footer />
    </div>
  );
}
