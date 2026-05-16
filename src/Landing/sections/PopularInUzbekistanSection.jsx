import { useState } from "react";

// Real data extracted from booking.com Apollo cache
const TABS = [
  { label: "Города внутри страны", id: 0 },
  { label: "Города в других странах", id: 1 },
  { label: "Страны", id: 2 },
  { label: "Жилье", id: 3 },
];

const TAB_LINKS = {
  0: [
    { title: "Отели в городе Самарканд", url: "#" },
    { title: "Отели в городе Chorwoq", url: "#" },
    { title: "Отели в городе Нукус", url: "#" },
    { title: "Отели в городе Ташкент", url: "#" },
    { title: "Отели в городе Бухара", url: "#" },
    { title: "Отели в городе Chilanzar", url: "#" },
  ],
  1: [
    { title: "Отели в городе Вертхайм", subtitle: "Германия", url: "#" },
    { title: "Отели в городе Тбилиси", subtitle: "Грузия", url: "#" },
    { title: "Отели в городе Шымкент", subtitle: "Казахстан", url: "#" },
  ],
  2: [
    { title: "Узбекистан", url: "#" },
    { title: "Казахстан", url: "#" },
    { title: "Грузия", url: "#" },
    { title: "Германия", url: "#" },
  ],
  3: [
    { title: "Виллы", url: "#" },
    { title: "Недорогие отели", url: "#" },
  ],
};

const BOTTOM_LINKS = [
  "Страны",
  "Регионы",
  "Города",
  "Районы",
  "Аэропорты",
  "Отели",
  "Ориентиры",
  "Дома для отпуска",
  "Апартаменты/квартиры",
  "Курортные отели",
  "Виллы",
  "Хостелы",
  "Отели типа «постель и завтрак»",
  "Гостевые дома",
  "Уникальное жильё",
  "Все направления",
  "Авиабилеты: все направления",
  "Все пункты проката",
  "Все направления для отпуска",
  "Советы",
  "Идеи для поездки",
  "Жильё на месяц",
];

export default function PopularInUzbekistanSection() {
  const [activeTab, setActiveTab] = useState(0);
  const currentLinks = TAB_LINKS[activeTab] || [];

  return (
    <section
      style={{
        padding: "32px 0 24px",
        borderTop: "1px solid var(--booking-border)",
      }}
    >
      <div className="site-container">
        <h2 className="section-heading">
          Популярно среди путешественников из Узбекистана
        </h2>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
            flexWrap: "wrap",
            marginTop: 12,
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pill-tab ${activeTab === tab.id ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Links grid */}
        <div className="popular-links-grid">
          {currentLinks.map((link, i) => (
            <div key={i}>
              <a
                href={link.url}
                style={{
                  color: "var(--booking-blue-light)",
                  textDecoration: "none",
                  fontSize: 14,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.textDecoration = "underline")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.textDecoration = "none")
                }
              >
                {link.title}
              </a>
              {link.subtitle && (
                <div
                  style={{ fontSize: 12, color: "var(--booking-text-light)" }}
                >
                  {link.subtitle}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom links */}
        <div className="link-cloud">
          {BOTTOM_LINKS.map((link, i) => (
            <span key={i} className="link-cloud-item">
              <a
                href="#"
                style={{
                  color: "var(--booking-text-light)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = "underline";
                  e.currentTarget.style.color = "var(--booking-blue)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = "none";
                  e.currentTarget.style.color = "var(--booking-text-light)";
                }}
              >
                {link}
              </a>
              {i < BOTTOM_LINKS.length - 1 && (
                <span style={{ margin: "0 6px" }}>·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
