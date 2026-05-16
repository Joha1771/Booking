import { useNavigate } from "react-router-dom";

const FOOTER_SECTIONS = [
  {
    title: "Помощь",
    links: [
      { label: "Управлять поездками", path: "/profile" },
      { label: "Связаться с нами", path: "/" },
      { label: "Центр знаний по безопасности", path: "/" },
    ],
  },
  {
    title: "Разное",
    links: [
      { label: "Программа лояльности Genius", path: "/genius" },
      { label: "Сезонные и праздничные спецпредложения", path: "/search" },
      { label: "Статьи о путешествиях", path: "/" },
      { label: "Booking.com для бизнеса", path: "/" },
      { label: "Прокат автомобилей", path: "/car-rental" },
      { label: "Поиск авиабилетов", path: "/flights" },
      { label: "Заказ такси", path: "/taxi" },
      { label: "Варианты досуга", path: "/attractions" },
    ],
  },
  {
    title: "Правила и настройки",
    links: [
      { label: "Положение о конфиденциальности", path: "/" },
      { label: "Условия предоставления услуг", path: "/" },
      { label: "Заявление о доступности", path: "/" },
      { label: "Разрешение споров", path: "/" },
    ],
  },
  {
    title: "Партнёрам",
    links: [
      { label: "Войти в Экстранет", path: "/" },
      { label: "Центр помощи партнёрам", path: "/" },
      { label: "Зарегистрировать свой объект", path: "/" },
      { label: "Программа для аффилиатов", path: "/" },
    ],
  },
  {
    title: "Компания",
    links: [
      { label: "О Booking.com", path: "/" },
      { label: "Как мы работаем", path: "/" },
      { label: "Устойчивое развитие", path: "/" },
      { label: "Пресс-центр", path: "/" },
      { label: "Вакансии", path: "/" },
    ],
  },
];

const BOTTOM_LINKS = [
  { label: "Страны", path: "/attractions" },
  { label: "Регионы", path: "/attractions" },
  { label: "Города", path: "/attractions" },
  { label: "Районы", path: "/search" },
  { label: "Аэропорты", path: "/search" },
  { label: "Отели", path: "/search" },
  { label: "Ориентиры", path: "/" },
  { label: "Дома для отпуска", path: "/search" },
  { label: "Апартаменты/квартиры", path: "/search" },
  { label: "Курортные отели", path: "/search" },
  { label: "Виллы", path: "/search" },
  { label: "Хостелы", path: "/search" },
  { label: "Гостевые дома", path: "/search" },
  { label: "Уникальное жильё", path: "/search" },
  { label: "Все направления", path: "/attractions" },
  { label: "Авиабилеты", path: "/flights" },
  { label: "Прокат авто", path: "/car-rental" },
  { label: "Варианты досуга", path: "/attractions" },
  { label: "Такси", path: "/taxi" },
];

export default function Footer() {
  const navigate = useNavigate();

  const handleLink = (e, path) => {
    e.preventDefault();
    navigate(path || "/");
  };

  return (
    <footer
      style={{
        background: "#fff",
        borderTop: "1px solid var(--booking-border)",
        marginTop: 16,
      }}
    >
      <div
        className="site-container"
        style={{ paddingTop: 32, paddingBottom: 24 }}
      >
        {/* Bottom links row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px 0",
            marginBottom: 24,
            fontSize: 13,
            color: "#595959",
            borderBottom: "1px solid var(--booking-border)",
            paddingBottom: 20,
          }}
        >
          {BOTTOM_LINKS.map((link, i) => (
            <span key={i}>
              <a
                href={link.path}
                onClick={(e) => handleLink(e, link.path)}
                style={{ color: "#595959", textDecoration: "none" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.textDecoration = "underline")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.textDecoration = "none")
                }
              >
                {link.label}
              </a>
              {i < BOTTOM_LINKS.length - 1 && (
                <span style={{ margin: "0 8px", color: "#ccc" }}>·</span>
              )}
            </span>
          ))}
        </div>

        {/* Main footer grid */}
        <div className="site-footer-grid">
          {FOOTER_SECTIONS.map((section, i) => (
            <div key={i}>
              <div className="footer-heading">{section.title}</div>
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {section.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href={link.path}
                      onClick={(e) => handleLink(e, link.path)}
                      style={{
                        color: "var(--booking-blue-light)",
                        textDecoration: "none",
                        fontSize: 13,
                        lineHeight: 1.4,
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.textDecoration = "underline")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.textDecoration = "none")
                      }
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--booking-border)" }}>
        <div
          className="site-container"
          style={{ paddingTop: 16, paddingBottom: 16 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <img
              src="https://flagcdn.com/20x15/uz.png"
              alt="UZ"
              style={{ width: 24, borderRadius: 2 }}
            />
            <span style={{ fontSize: 14, fontWeight: 600 }}>UZS</span>
          </div>
          <div
            style={{
              color: "var(--booking-text-light)",
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            Booking.com — часть Booking Holdings Inc., мирового лидера в сфере
            онлайн-туризма и сопутствующих услуг.
            <br />
            Copyright © 1996–2026 Booking.com™. Все права защищены.
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {["Booking.com", "priceline", "KAYAK", "agoda", "OpenTable"].map(
              (brand, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color:
                      i === 0
                        ? "var(--booking-blue)"
                        : "var(--booking-text-light)",
                  }}
                >
                  {brand}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
