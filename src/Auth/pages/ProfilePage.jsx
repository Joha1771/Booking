import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header.jsx";
import Footer from "../../components/layout/Footer.jsx";
import {
  User,
  MapPin,
  CreditCard,
  Bell,
  LogOut,
  ChevronRight,
  Star,
  Calendar,
  Heart,
} from "lucide-react";

const TABS = [
  { key: "bookings", label: "📅 Бронирования" },
  { key: "saved", label: "❤️ Сохранённые" },
  { key: "settings", label: "⚙️ Настройки" },
];

const MOCK_BOOKINGS = [
  {
    id: "BK-A3F7X",
    hotel: "Citadines Metro Central Dubai",
    location: "Дубай, ОАЭ",
    checkIn: "19 мая 2025",
    checkOut: "21 мая 2025",
    nights: 2,
    price: 1246040,
    status: "upcoming",
    image: "https://picsum.photos/seed/hotel1/200/130",
  },
  {
    id: "BK-C9P2M",
    hotel: "South Hotel Tashkent",
    location: "Ташкент, Узбекистан",
    checkIn: "3 апреля 2025",
    checkOut: "5 апреля 2025",
    nights: 2,
    price: 2237706,
    status: "completed",
    image: "https://picsum.photos/seed/hotel8/200/130",
  },
  {
    id: "BK-M1Q8Z",
    hotel: "Orient Star Khiva",
    location: "Хива, Узбекистан",
    checkIn: "14 марта 2025",
    checkOut: "16 марта 2025",
    nights: 2,
    price: 1912444,
    status: "completed",
    image: "https://picsum.photos/seed/unique1/200/130",
  },
];

const SAVED = [
  {
    id: 1,
    name: "Shahdag Hotel & Spa",
    location: "Шахдаг, Азербайджан",
    price: 1116933,
    rating: 9.3,
    image: "https://picsum.photos/seed/unique3/200/130",
  },
  {
    id: 2,
    name: "Tsinandali Estate",
    location: "Tsinandali, Грузия",
    price: 3349049,
    rating: 9.2,
    image: "https://picsum.photos/seed/unique2/200/130",
  },
];

const STATUS_COLORS = {
  upcoming: { bg: "#e8f5e9", color: "#00a550", label: "Предстоящее" },
  completed: { bg: "#f5f5f5", color: "#888", label: "Завершено" },
  cancelled: { bg: "#fff0f0", color: "#e00", label: "Отменено" },
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("bookings");
  const navigate = useNavigate();
  const fmt = (p) => Math.round(p).toLocaleString("ru-RU");

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Header />

      <div className="page-shell" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="split-layout">
          {/* Sidebar */}
          <div className="sidebar-panel">
            {/* User card */}
            <div
              style={{
                background: "#fff",
                borderRadius: 8,
                border: "1px solid var(--booking-border)",
                padding: 24,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "#f5a623",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 28,
                  color: "#fff",
                  margin: "0 auto 12px",
                }}
              >
                J
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                Joha Salimov
              </div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
                joha@example.com
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--booking-blue)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: 20,
                }}
              >
                <Star size={12} fill="#febb02" color="#febb02" />
                Genius 1-го уровня
              </div>

              <div style={{ marginTop: 16, fontSize: 12, color: "#888" }}>
                Ещё <b>3 поездки</b> до Genius 2-го уровня
              </div>
              <div
                style={{
                  marginTop: 8,
                  height: 4,
                  background: "#e0e0e0",
                  borderRadius: 2,
                }}
              >
                <div
                  style={{
                    width: "40%",
                    height: "100%",
                    background: "var(--booking-blue)",
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>

            {/* Nav */}
            <div
              style={{
                background: "#fff",
                borderRadius: 8,
                border: "1px solid var(--booking-border)",
                overflow: "hidden",
              }}
            >
              {TABS.map((tab, i) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    border: "none",
                    borderBottom:
                      i < TABS.length - 1
                        ? "1px solid var(--booking-border)"
                        : "none",
                    background: activeTab === tab.key ? "#ebf3ff" : "#fff",
                    color:
                      activeTab === tab.key ? "var(--booking-blue)" : "#333",
                    fontSize: 14,
                    fontWeight: activeTab === tab.key ? 700 : 400,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {tab.label}
                  <ChevronRight size={16} color="#888" />
                </button>
              ))}
              <button
                onClick={() => navigate("/login")}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 16px",
                  border: "none",
                  borderTop: "1px solid var(--booking-border)",
                  background: "#fff",
                  color: "#e00",
                  fontSize: 14,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <LogOut size={15} /> Выйти
              </button>
            </div>
          </div>

          {/* Main content */}
          <div style={{ flex: 1 }}>
            {activeTab === "bookings" && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
                  Мои бронирования
                </h2>

                {/* Filter tabs */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  {["Все", "Предстоящие", "Завершённые", "Отменённые"].map(
                    (f, i) => (
                      <button
                        key={f}
                        className={`pill-tab ${i === 0 ? "active" : ""}`}
                      >
                        {f}
                      </button>
                    ),
                  )}
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {MOCK_BOOKINGS.map((b) => {
                    const st = STATUS_COLORS[b.status];
                    return (
                      <div
                        key={b.id}
                        style={{
                          background: "#fff",
                          border: "1px solid var(--booking-border)",
                          borderRadius: 8,
                          overflow: "hidden",
                        }}
                      >
                        <div className="booking-card-row">
                          <img
                            src={b.image}
                            alt={b.hotel}
                            style={{
                              width: 160,
                              height: 120,
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                            onError={(e) =>
                              (e.currentTarget.src =
                                "https://picsum.photos/seed/default/160/120")
                            }
                          />
                          <div className="booking-card-content">
                            <div>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#888",
                                  marginBottom: 4,
                                }}
                              >
                                <MapPin
                                  size={11}
                                  style={{
                                    display: "inline",
                                    verticalAlign: "middle",
                                  }}
                                />{" "}
                                {b.location}
                              </div>
                              <div
                                style={{
                                  fontSize: 16,
                                  fontWeight: 700,
                                  marginBottom: 8,
                                }}
                              >
                                {b.hotel}
                              </div>
                              <div
                                style={{
                                  fontSize: 13,
                                  color: "#555",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <Calendar size={13} />
                                {b.checkIn} — {b.checkOut} · {b.nights} ночи
                              </div>
                              <div
                                style={{
                                  marginTop: 10,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: "#888",
                                }}
                              >
                                #{b.id}
                              </div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <div
                                style={{
                                  display: "inline-block",
                                  background: st.bg,
                                  color: st.color,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  padding: "3px 10px",
                                  borderRadius: 20,
                                  marginBottom: 12,
                                }}
                              >
                                {st.label}
                              </div>
                              <div
                                style={{
                                  fontSize: 16,
                                  fontWeight: 700,
                                  marginBottom: 8,
                                }}
                              >
                                UZS {fmt(b.price)}
                              </div>
                              {b.status === "upcoming" && (
                                <button
                                  style={{
                                    background: "transparent",
                                    border: "1px solid #e00",
                                    color: "#e00",
                                    borderRadius: 4,
                                    padding: "6px 14px",
                                    fontSize: 13,
                                    cursor: "pointer",
                                  }}
                                >
                                  Отменить
                                </button>
                              )}
                              {b.status === "completed" && (
                                <button
                                  style={{
                                    background: "transparent",
                                    border: "1px solid var(--booking-blue)",
                                    color: "var(--booking-blue)",
                                    borderRadius: 4,
                                    padding: "6px 14px",
                                    fontSize: 13,
                                    cursor: "pointer",
                                  }}
                                >
                                  Оставить отзыв
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "saved" && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
                  Сохранённые места
                </h2>
                <div className="saved-grid">
                  {SAVED.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        background: "#fff",
                        border: "1px solid var(--booking-border)",
                        borderRadius: 8,
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.boxShadow =
                          "0 4px 16px rgba(0,0,0,0.12)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.boxShadow = "none")
                      }
                    >
                      <div style={{ position: "relative" }}>
                        <img
                          src={s.image}
                          alt={s.name}
                          style={{
                            width: "100%",
                            height: 160,
                            objectFit: "cover",
                          }}
                        />
                        <button
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            background: "rgba(255,255,255,0.9)",
                            border: "none",
                            borderRadius: "50%",
                            width: 32,
                            height: 32,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <Heart size={16} fill="#e00" color="#e00" />
                        </button>
                      </div>
                      <div style={{ padding: "12px 14px" }}>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: "var(--booking-blue-light)",
                            marginBottom: 4,
                          }}
                        >
                          {s.name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#888",
                            marginBottom: 8,
                          }}
                        >
                          {s.location}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              background: "var(--booking-blue)",
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: 13,
                              padding: "3px 7px",
                              borderRadius: "4px 4px 4px 0",
                            }}
                          >
                            {s.rating}
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>
                            UZS {fmt(s.price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
                  Настройки аккаунта
                </h2>

                <div
                  style={{
                    background: "#fff",
                    borderRadius: 8,
                    border: "1px solid var(--booking-border)",
                    padding: 24,
                    marginBottom: 16,
                  }}
                >
                  <h3
                    style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}
                  >
                    Личные данные
                  </h3>
                  <div className="form-grid-2">
                    {[
                      { label: "Имя", value: "Joha" },
                      { label: "Фамилия", value: "Salimov" },
                      { label: "Email", value: "joha@example.com" },
                      { label: "Телефон", value: "+998 90 123 45 67" },
                      { label: "Страна", value: "Узбекистан" },
                      { label: "Язык", value: "Русский" },
                    ].map((f, i) => (
                      <div key={i}>
                        <label
                          style={{
                            fontSize: 12,
                            color: "#888",
                            display: "block",
                            marginBottom: 4,
                          }}
                        >
                          {f.label}
                        </label>
                        <input
                          defaultValue={f.value}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            border: "1px solid var(--booking-border)",
                            borderRadius: 4,
                            fontSize: 14,
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    style={{
                      marginTop: 20,
                      background: "var(--booking-blue-light)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "10px 24px",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Сохранить изменения
                  </button>
                </div>

                <div
                  style={{
                    background: "#fff",
                    borderRadius: 8,
                    border: "1px solid var(--booking-border)",
                    padding: 24,
                  }}
                >
                  <h3
                    style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}
                  >
                    Уведомления
                  </h3>
                  {[
                    {
                      label: "Email-уведомления о бронированиях",
                      checked: true,
                    },
                    {
                      label: "Специальные предложения и скидки",
                      checked: true,
                    },
                    { label: "Напоминания о поездках", checked: true },
                    {
                      label: "Рекомендации на основе предпочтений",
                      checked: false,
                    },
                  ].map((opt, i) => (
                    <label
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 12,
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                    >
                      <input type="checkbox" defaultChecked={opt.checked} />
                      {opt.label}
                    </label>
                  ))}
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
