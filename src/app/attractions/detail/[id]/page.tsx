"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Heart,
  Share2,
  Star,
  Clock3,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  searchAttractionsClient,
  getAttractionCities,
  getAttractionDiscoveryCards,
  getAttractionById,
} from "@/lib/api/attractions.client";

function fmt(p: number) {
  if (!p || p <= 0) return "Бесплатно";
  return `UZS ${Math.round(p).toLocaleString("ru-RU")}`;
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.3;
  return (
    <span style={{ color: "#febb02", fontSize: 18 }}>
      {"★".repeat(full)}
      {half ? "½" : ""}
      <span style={{ color: "#e0e0e0" }}>
        {"★".repeat(5 - full - (half ? 1 : 0))}
      </span>
    </span>
  );
}

function RatingLabel(r: number) {
  if (r >= 4.7) return "Потрясающе";
  if (r >= 4.5) return "Превосходно";
  if (r >= 4.0) return "Очень хорошо";
  if (r >= 3.5) return "Хорошо";
  return "Приемлемо";
}

export default function AttractionDetailPage() {
  const router = useRouter();
  const navigate = (p: string) => router.push(p);
  const pathname = usePathname();
  const id = pathname.split("/").pop();

  const { data: attraction, isLoading } = useQuery({
    queryKey: ["attraction", id],
    queryFn: () => getAttractionById(id!),
    enabled: !!id,
  });

  const [liked, setLiked] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [guests, setGuests] = useState(1);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <Header />
        <div
          style={{
            maxWidth: 1150,
            margin: "60px auto",
            padding: "0 16px",
            textAlign: "center",
            color: "#888",
          }}
        >
          <div style={{ fontSize: 16 }}>Загрузка...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!attraction) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <Header />
        <div
          style={{
            maxWidth: 1150,
            margin: "60px auto",
            padding: "0 16px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 18, marginBottom: 16 }}>
            Вариант досуга не найден.
          </p>
          <button
            onClick={() => navigate("/attractions")}
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
            Все варианты досуга
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Build photo gallery
  const photos = [
    attraction.image_url,
    ...(Array.isArray((attraction as any).gallery_images)
      ? (attraction as any).gallery_images
      : []),
    ...Array.from(
      { length: 4 },
      (_, i) =>
        `https://picsum.photos/seed/${attraction.id}_gallery_${i}/800/500`,
    ),
  ]
    .filter(Boolean)
    .slice(0, 9);

  const totalPrice = attraction.price * guests;
  const rating = Number(attraction.rating) || 4.4;
  const reviews = Number(attraction.reviews_count) || 0;
  const includes = Array.isArray(attraction.includes)
    ? attraction.includes
    : [];
  const excludes = Array.isArray(attraction.excludes)
    ? attraction.excludes
    : [];
  const description =
    attraction.description ||
    (attraction as any).short_description ||
    `Популярное развлечение в городе ${attraction.city}.`;

  // Get next 7 days for date selection
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
  const DAY_NAMES = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
  const MONTH_NAMES = [
    "янв",
    "фев",
    "мар",
    "апр",
    "май",
    "июн",
    "июл",
    "авг",
    "сен",
    "окт",
    "ноя",
    "дек",
  ];

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

      {/* Breadcrumbs */}
      <div
        style={{
          maxWidth: 1150,
          margin: "0 auto",
          padding: "12px 16px",
          fontSize: 13,
          color: "#0071c2",
        }}
      >
        <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          Главная
        </span>
        <span style={{ margin: "0 6px", color: "#888" }}>›</span>
        <span
          onClick={() => navigate("/attractions")}
          style={{ cursor: "pointer" }}
        >
          Варианты досуга
        </span>
        {attraction.city && (
          <>
            <span style={{ margin: "0 6px", color: "#888" }}>›</span>
            <span
              onClick={() =>
                navigate(
                  `/attractions/${(attraction as any).city_slug || attraction.city?.toLowerCase()}`,
                )
              }
              style={{ cursor: "pointer" }}
            >
              {attraction.city}
            </span>
          </>
        )}
        <span style={{ margin: "0 6px", color: "#888" }}>›</span>
        <span style={{ color: "#333" }}>{attraction.name}</span>
      </div>

      <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px 48px" }}>
        {/* Title + actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            {attraction.badge && (
              <div
                style={{
                  display: "inline-block",
                  background: "#fff4d5",
                  color: "#8a5a00",
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "4px 10px",
                  borderRadius: 999,
                  marginBottom: 8,
                }}
              >
                {attraction.badge}
              </div>
            )}
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {attraction.name}
            </h1>
            {attraction.city && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 6,
                  color: "#595959",
                  fontSize: 14,
                }}
              >
                <MapPin size={14} />
                <span>
                  {attraction.city}, {attraction.country}
                </span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setLiked(!liked)}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1px solid #e0e0e0",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Heart
                size={18}
                fill={liked ? "#e00" : "none"}
                color={liked ? "#e00" : "#555"}
              />
            </button>
            <button
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1px solid #e0e0e0",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Share2 size={18} color="#555" />
            </button>
          </div>
        </div>

        {/* Rating summary */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <StarRating rating={rating} />
          <span style={{ fontSize: 16, fontWeight: 700 }}>
            {rating.toFixed(1)}
          </span>
          <span style={{ fontSize: 14, color: "#595959" }}>
            · {RatingLabel(rating)} ({reviews.toLocaleString("ru-RU")} отзывов)
          </span>
        </div>

        {/* Photo grid + booking panel */}
        <div style={{ className: "attr-detail-layout" } as React.CSSProperties}>
          {/* Left: photos + info */}
          <div>
            {/* Main photo + grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gridTemplateRows: "300px 150px",
                gap: 6,
                borderRadius: 12,
                overflow: "hidden",
                marginBottom: 24,
              }}
            >
              <img
                src={photos[activePhoto] || photos[0]}
                alt={attraction.name}
                style={{
                  gridRow: "1 / 3",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://picsum.photos/seed/${attraction.id}/800/500`;
                }}
              />
              {photos.slice(1, 5).map((photo, i) => (
                <div
                  key={i}
                  style={{ position: "relative", overflow: "hidden" }}
                >
                  <img
                    src={photo}
                    alt=""
                    onClick={() => setActivePhoto(i + 1)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://picsum.photos/seed/${attraction.id}_${i}/400/300`;
                    }}
                  />
                  {i === 3 && photos.length > 5 && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: "pointer",
                      }}
                    >
                      +{photos.length - 5} фото
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Key info badges */}
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 24,
              }}
            >
              {attraction.free_cancel && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#008234",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle size={16} />
                  Доступна бесплатная отмена
                </div>
              )}
              {attraction.duration_hours > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#595959",
                    fontSize: 13,
                  }}
                >
                  <Clock3 size={16} />
                  Продолжительность:{" "}
                  {(attraction as any).duration_label ||
                    `${attraction.duration_hours} ч.`}
                </div>
              )}
            </div>

            {/* Description */}
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
                Описание
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: "#333" }}>
                {description}
              </p>
            </section>

            {/* Includes / Excludes */}
            {(includes.length > 0 || excludes.length > 0) && (
              <section style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
                  Что входит в бронирование
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 24,
                  }}
                >
                  {includes.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          marginBottom: 10,
                          color: "#008234",
                        }}
                      >
                        Включено
                      </div>
                      {includes.map((item, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            gap: 8,
                            marginBottom: 8,
                            fontSize: 14,
                          }}
                        >
                          <CheckCircle
                            size={16}
                            color="#008234"
                            style={{ flexShrink: 0, marginTop: 1 }}
                          />
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                  {excludes.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          marginBottom: 10,
                          color: "#cc0000",
                        }}
                      >
                        Не включено
                      </div>
                      {excludes.map((item, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            gap: 8,
                            marginBottom: 8,
                            fontSize: 14,
                          }}
                        >
                          <XCircle
                            size={16}
                            color="#cc0000"
                            style={{ flexShrink: 0, marginTop: 1 }}
                          />
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Rating breakdown */}
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
                Оценки клиентов
              </h2>
              <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1 }}>
                    {rating.toFixed(1)}
                  </div>
                  <StarRating rating={rating} />
                  <div style={{ fontSize: 13, color: "#595959", marginTop: 4 }}>
                    {RatingLabel(rating)}
                  </div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    ({reviews.toLocaleString("ru-RU")} отзывов)
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {[
                    {
                      label: "Общие впечатления",
                      score: (rating + 0.1).toFixed(1),
                    },
                    { label: "Удобства", score: (rating + 0.1).toFixed(1) },
                    { label: "Качество услуг", score: rating.toFixed(1) },
                    {
                      label: "Насколько легко добраться",
                      score: (rating + 0.3).toFixed(1),
                    },
                  ].map((cat) => (
                    <div
                      key={cat.label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 13, color: "#595959" }}>
                        {cat.label}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 120,
                            height: 6,
                            background: "#f0f0f0",
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${(Number(cat.score) / 5) * 100}%`,
                              height: "100%",
                              background: "#003580",
                              borderRadius: 3,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            minWidth: 28,
                          }}
                        >
                          {cat.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
                Часто задаваемые вопросы
              </h2>
              {[
                {
                  q: "Как забронировать билет?",
                  a: "Выберите дату и количество участников, введите личные данные и выберите способ оплаты. После успешного бронирования вы получите электронное письмо с подтверждением.",
                },
                {
                  q: "Когда нужно внести оплату?",
                  a: "Оплата взимается в момент бронирования от лица поставщика услуг.",
                },
                {
                  q: "Как воспользоваться электронным билетом?",
                  a: "Покажите QR-код или числовой код с вашего мобильного устройства при входе.",
                },
                {
                  q: "Можно ли отменить бронирование?",
                  a: attraction.free_cancel
                    ? "Да, для этого варианта досуга доступна бесплатная отмена (уточняйте условия при бронировании)."
                    : "После бронирования изменить или отменить бронирование невозможно.",
                },
              ].map((faq, i) => (
                <details
                  key={i}
                  style={{
                    borderBottom: "1px solid #e7e7e7",
                    padding: "14px 0",
                  }}
                >
                  <summary
                    style={{
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: "pointer",
                      listStyle: "none",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    {faq.q} <ChevronRight size={16} />
                  </summary>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#595959",
                      marginTop: 10,
                      lineHeight: 1.6,
                    }}
                  >
                    {faq.a}
                  </p>
                </details>
              ))}
            </section>
          </div>

          {/* Right: Booking panel */}
          <div style={{ position: "sticky", top: 16 }}>
            <div
              style={{
                border: "1px solid #e7e7e7",
                borderRadius: 12,
                padding: 20,
                boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ fontSize: 13, color: "#595959", marginBottom: 4 }}>
                Билеты и цены
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>
                {fmt(attraction.price)}
              </div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 20 }}>
                Включая налоги и сборы
              </div>

              {/* Date selector */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}
                >
                  Проверьте наличие мест по дате
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    overflowX: "auto",
                    paddingBottom: 4,
                  }}
                >
                  {dates.map((d, i) => {
                    const isSelected =
                      selectedDate === d.toISOString().slice(0, 10);
                    const isToday = i === 0;
                    return (
                      <button
                        key={i}
                        onClick={() =>
                          setSelectedDate(d.toISOString().slice(0, 10))
                        }
                        style={{
                          minWidth: 52,
                          padding: "8px 6px",
                          borderRadius: 8,
                          border: isSelected
                            ? "2px solid #0071c2"
                            : "1px solid #e0e0e0",
                          background: isSelected ? "#e8f0fe" : "#fff",
                          cursor: "pointer",
                          textAlign: "center",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            color: isSelected ? "#0071c2" : "#888",
                          }}
                        >
                          {DAY_NAMES[d.getDay()]}
                        </div>
                        <div
                          style={{
                            fontSize: 17,
                            fontWeight: 700,
                            color: isSelected ? "#0071c2" : "#333",
                          }}
                        >
                          {d.getDate()}
                        </div>
                        <div style={{ fontSize: 10, color: "#888" }}>
                          {MONTH_NAMES[d.getMonth()]}
                        </div>
                        {isToday && (
                          <div
                            style={{
                              fontSize: 10,
                              color: "#0071c2",
                              fontWeight: 700,
                            }}
                          >
                            Сегодня
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guest count */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                  Количество участников
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="counter-btn"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      border: "1.5px solid #0071c2",
                      background: "#fff",
                      color: "#0071c2",
                      fontSize: 20,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      minWidth: 24,
                      textAlign: "center",
                    }}
                  >
                    {guests}
                  </span>
                  <button
                    onClick={() => setGuests(Math.min(20, guests + 1))}
                    className="counter-btn"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      border: "1.5px solid #0071c2",
                      background: "#fff",
                      color: "#0071c2",
                      fontSize: 20,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    +
                  </button>
                  <span style={{ fontSize: 13, color: "#595959" }}>
                    взрослых
                  </span>
                </div>
              </div>

              {/* Total */}
              {guests > 1 && (
                <div
                  style={{
                    background: "#f5f5f5",
                    borderRadius: 8,
                    padding: "10px 12px",
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 14,
                  }}
                >
                  <span>
                    {guests} × {fmt(attraction.price)}
                  </span>
                  <span style={{ fontWeight: 700 }}>{fmt(totalPrice)}</span>
                </div>
              )}

              {attraction.free_cancel && (
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                    color: "#008234",
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  <CheckCircle size={14} />
                  Доступна бесплатная отмена
                </div>
              )}

              <button
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "#0071c2",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
                onClick={() => alert("Функция бронирования скоро появится!")}
              >
                Забронировать
              </button>

              {(attraction as any).available_today && (
                <div
                  style={{
                    textAlign: "center",
                    color: "#008234",
                    fontSize: 13,
                    fontWeight: 700,
                    marginTop: 10,
                  }}
                >
                  Доступно с сегодняшнего дня
                </div>
              )}
            </div>

            {/* Genius block */}
            <div
              style={{
                marginTop: 16,
                border: "1px solid #e7e7e7",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    background: "#003580",
                    color: "#febb02",
                    fontWeight: 900,
                    fontSize: 14,
                    padding: "2px 8px",
                    borderRadius: 3,
                  }}
                >
                  Genius
                </span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  Ваши вознаграждения 1-го уровня
                </span>
              </div>
              <div style={{ fontSize: 13, color: "#595959" }}>
                Доступно для ряда вариантов. Скидка 10–37% применяется к цене
                без учёта налогов и сборов.
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
