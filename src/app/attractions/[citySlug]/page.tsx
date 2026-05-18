"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Heart,
  Star,
  Clock3,
  Ticket,
  Search,
  Calendar,
  ChevronDown,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  searchAttractionsClient,
  getAttractionCities,
  getAttractionDiscoveryCards,
  getAttractionById,
} from "@/lib/api/attractions.client";

function formatPrice(p: number) {
  if (!p || p <= 0) return "Бесплатно";
  return `UZS ${Math.round(p).toLocaleString("ru-RU")}`;
}

function buildLink(slug: string, category?: string, query?: string) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (query) params.set("query", query);
  const s = params.toString();
  return s ? `/attractions/${slug}?${s}` : `/attractions/${slug}`;
}

const SORT_OPTIONS = [
  { value: "recommended", label: "Мы рекомендуем" },
  { value: "price", label: "Самая низкая цена" },
  { value: "rating", label: "Лучшие по отзывам" },
  { value: "popular", label: "Популярные" },
];

export default function AttractionsCityPage() {
  const router = useRouter();
  const navigate = (p: string) => router.push(p);
  const searchParamsHook = useSearchParams();
  const pathname = usePathname();
  const citySlug = pathname.split("/").pop() || "all";

  const [searchDraft, setSearchDraft] = useState(
    searchParamsHook.get("query") || "",
  );
  const [date, setDate] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [priceLimit, setPriceLimit] = useState(1500000);
  const [freeCancel, setFreeCancel] = useState(false);
  const [availableToday, setAvailableToday] = useState(false);
  const [genius, setGenius] = useState(false);

  const activeCategory = searchParamsHook.get("category") || "";
  const activeQuery = searchParamsHook.get("query") || "";

  const { data: cities = [] } = useQuery({
    queryKey: ["attraction-cities"],
    queryFn: getAttractionCities,
  });
  const { data: baseItems = [], isLoading: baseLoading } = useQuery({
    queryKey: ["attractions", citySlug === "all" ? null : citySlug, 60],
    queryFn: () =>
      searchAttractionsClient({
        city: citySlug === "all" ? undefined : citySlug,
        limit: 60,
      }),
  });
  const { data: filteredItems = [], isLoading: filteredLoading } = useQuery({
    queryKey: [
      "attractions",
      "search",
      {
        city: citySlug === "all" ? undefined : citySlug,
        category: activeCategory || undefined,
        query: activeQuery || undefined,
        limit: 60,
      },
    ],
    queryFn: () =>
      searchAttractionsClient({
        city: citySlug === "all" ? undefined : citySlug,
        category: activeCategory || undefined,
        query: activeQuery || undefined,
        limit: 60,
      }),
    enabled: !!(activeCategory || activeQuery),
  });

  const cityMeta = cities.find((c) => c.slug === citySlug) ?? null;

  const items = activeCategory || activeQuery ? filteredItems : baseItems;
  const isLoading =
    activeCategory || activeQuery ? filteredLoading : baseLoading;

  // Category cards for top grid
  const categoryCards = useMemo(() => {
    const cats = [...new Set(baseItems.map((i) => i.category))].slice(0, 4);
    return cats.map((cat, idx) => ({
      category: cat,
      count: baseItems.filter((i) => i.category === cat).length,
      image:
        baseItems.find((i) => i.category === cat)?.image_url ||
        `https://picsum.photos/seed/${citySlug}-cat-${idx}/600/400`,
    }));
  }, [baseItems, citySlug]);

  // Filtered + sorted items
  const visibleItems = useMemo(() => {
    let list = items.filter((i) => Number(i.price || 0) <= priceLimit);
    if (freeCancel) list = list.filter((i) => i.free_cancel);
    if (availableToday) list = list.filter((i) => (i as any).available_today);
    if (genius) list = list.filter((i) => (i as any).is_genius);

    if (sortBy === "price") return [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "rating")
      return [...list].sort((a, b) => b.rating - a.rating);
    if (sortBy === "popular")
      return [...list].sort(
        (a, b) =>
          ((a as any).bestseller_rank || 999) -
          ((b as any).bestseller_rank || 999),
      );
    return [...list].sort((a, b) => {
      if ((b as any).is_genius !== (a as any).is_genius)
        return Number((b as any).is_genius) - Number((a as any).is_genius);
      return b.rating - a.rating;
    });
  }, [items, priceLimit, freeCancel, availableToday, genius, sortBy]);

  const cityName = cityMeta?.name || citySlug;
  const maxPrice = useMemo(() => {
    const prices = items.map((i) => Number(i.price || 0)).filter(Boolean);
    return prices.length ? Math.max(...prices) : 1500000;
  }, [items]);

  const handleSearch = () => {
    const q = searchDraft.trim();
    const next = new URLSearchParams(searchParamsHook.toString());
    if (q) next.set("query", q);
    else next.delete("query");
    router.push(`/attractions/${citySlug}?${next.toString()}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        color: "#1a1a1a",
      }}
    >
      <Header />

      {/* ── HERO SEARCHBAR (как на Booking) ─────────────────── */}
      <div style={{ background: "#003580", padding: "16px 0" }}>
        <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
          <div
            style={{
              background: "#febb02",
              borderRadius: 4,
              padding: 4,
              display: "flex",
              gap: 4,
            }}
          >
            {/* Destination */}
            <div
              style={{
                flex: 2,
                background: "#fff",
                borderRadius: 2,
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                minHeight: 48,
              }}
            >
              <Search size={16} color="#555" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: "#888" }}>Направление</div>
                <input
                  value={searchDraft}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchDraft(e.target.value)
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={cityName}
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    width: "100%",
                    background: "transparent",
                  }}
                />
              </div>
              {searchDraft && (
                <button
                  onClick={() => setSearchDraft("")}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 18,
                    color: "#888",
                    cursor: "pointer",
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              )}
            </div>
            {/* Date */}
            <div
              style={{
                flex: 1,
                background: "#fff",
                borderRadius: 2,
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                minHeight: 48,
              }}
            >
              <Calendar size={16} color="#555" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 10, color: "#888" }}>Даты</div>
                <input
                  type="date"
                  value={date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setDate(e.target.value)
                  }
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: 14,
                    background: "transparent",
                    cursor: "pointer",
                  }}
                />
              </div>
            </div>
            <button
              onClick={handleSearch}
              style={{
                background: "#0071c2",
                color: "#fff",
                border: "none",
                borderRadius: 2,
                padding: "0 24px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Проверить цены
            </button>
          </div>
        </div>
      </div>

      <div
        style={{ maxWidth: 1150, margin: "0 auto", padding: "20px 16px 48px" }}
      >
        {/* ── BREADCRUMB ────────────────────────────────────── */}
        <div style={{ fontSize: 13, color: "#595959", marginBottom: 12 }}>
          <span
            onClick={() => navigate("/")}
            style={{ color: "#0071c2", cursor: "pointer" }}
          >
            Главная
          </span>
          <span style={{ margin: "0 6px" }}>›</span>
          <span
            onClick={() => navigate("/attractions")}
            style={{ color: "#0071c2", cursor: "pointer" }}
          >
            Варианты досуга
          </span>
          <span style={{ margin: "0 6px" }}>›</span>
          <span>{cityName}</span>
        </div>

        <div className="attr-page-layout" style={{}}>
          {/* ── LEFT SIDEBAR ──────────────────────────────── */}
          <div style={{ position: "sticky", top: 16 }}>
            <div
              style={{
                background: "#fff",
                border: "1px solid #e7e7e7",
                borderRadius: 8,
                padding: 20,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
                Фильтры
              </div>

              {/* Categories as checkboxes */}
              <div
                style={{
                  marginBottom: 20,
                  paddingBottom: 20,
                  borderBottom: "1px solid #e7e7e7",
                }}
              >
                <div
                  style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}
                >
                  Категории
                </div>
                {[...new Set(baseItems.map((i) => i.category))]
                  .filter(Boolean)
                  .map((cat) => {
                    const count = baseItems.filter(
                      (i) => i.category === cat,
                    ).length;
                    const checked = activeCategory === cat;
                    return (
                      <label
                        key={cat}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 10,
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              navigate(
                                buildLink(
                                  citySlug,
                                  checked ? "" : cat,
                                  activeQuery,
                                ),
                              )
                            }
                            style={{
                              width: 16,
                              height: 16,
                              accentColor: "#0071c2",
                              cursor: "pointer",
                            }}
                          />
                          <span
                            style={{
                              color: checked ? "#0071c2" : "#333",
                              fontWeight: checked ? 700 : 400,
                            }}
                          >
                            {cat}
                          </span>
                        </div>
                        <span style={{ fontSize: 13, color: "#595959" }}>
                          {count}
                        </span>
                      </label>
                    );
                  })}
              </div>

              {/* Price range */}
              <div
                style={{
                  marginBottom: 20,
                  paddingBottom: 20,
                  borderBottom: "1px solid #e7e7e7",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                  Максимальная цена
                </div>
                <div
                  style={{ fontSize: 13, color: "#595959", marginBottom: 10 }}
                >
                  UZS 0 – {formatPrice(priceLimit)}
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxPrice || 1500000}
                  step={10000}
                  value={priceLimit}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPriceLimit(Number(e.target.value))
                  }
                  style={{ width: "100%", accentColor: "#0071c2" }}
                />
              </div>

              {/* Perks */}
              <div
                style={{
                  marginBottom: 20,
                  paddingBottom: 20,
                  borderBottom: "1px solid #e7e7e7",
                }}
              >
                <div
                  style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}
                >
                  Особенности
                </div>
                {[
                  {
                    label: "Бесплатная отмена",
                    count: baseItems.filter((i) => i.free_cancel).length,
                    val: freeCancel,
                    set: setFreeCancel,
                  },
                  {
                    label: "Доступно сегодня",
                    count: baseItems.filter((i) => (i as any).available_today)
                      .length,
                    val: availableToday,
                    set: setAvailableToday,
                  },
                  {
                    label: "Genius",
                    count: baseItems.filter((i) => (i as any).is_genius).length,
                    val: genius,
                    set: setGenius,
                  },
                ].map((p) => (
                  <label
                    key={p.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <input
                        type="checkbox"
                        checked={p.val}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          p.set(e.target.checked)
                        }
                        style={{
                          width: 16,
                          height: 16,
                          accentColor: "#0071c2",
                          cursor: "pointer",
                        }}
                      />
                      <span
                        style={{
                          color: p.val ? "#0071c2" : "#333",
                          fontWeight: p.val ? 700 : 400,
                        }}
                      >
                        {p.label}
                      </span>
                    </div>
                    <span style={{ fontSize: 13, color: "#595959" }}>
                      {p.count}
                    </span>
                  </label>
                ))}
              </div>

              {/* Rating */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}
                >
                  Оценка по отзывам
                </div>
                {[
                  { label: "Не ниже 4.5", min: 4.5 },
                  { label: "Не ниже 4", min: 4.0 },
                  { label: "Не ниже 3.5", min: 3.5 },
                  { label: "Не ниже 3", min: 3.0 },
                ].map((r) => {
                  const count = baseItems.filter(
                    (i) => Number(i.rating) >= r.min,
                  ).length;
                  return (
                    <label
                      key={r.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 10,
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <input
                          type="checkbox"
                          style={{
                            width: 16,
                            height: 16,
                            accentColor: "#0071c2",
                            cursor: "pointer",
                          }}
                        />
                        <span>{r.label}</span>
                      </div>
                      <span style={{ fontSize: 13, color: "#595959" }}>
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setFreeCancel(false);
                  setAvailableToday(false);
                  setGenius(false);
                  setPriceLimit(maxPrice);
                  setSortBy("recommended");
                  setSearchDraft("");
                  router.push(`/attractions/${citySlug}`);
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "#fff",
                  border: "1px solid #0071c2",
                  color: "#0071c2",
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Сбросить фильтры
              </button>
            </div>
          </div>

          {/* ── RIGHT CONTENT ──────────────────────────────── */}
          <div>
            {/* Results header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
                  {isLoading
                    ? "Загрузка..."
                    : `${visibleItems.length} вариантов`}
                </h1>
                <p
                  style={{ fontSize: 14, color: "#595959", margin: "4px 0 0" }}
                >
                  Развлечения, билеты и экскурсии в городе {cityName}.
                </p>
              </div>

              {/* Sort */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 20,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      border:
                        sortBy === opt.value
                          ? "2px solid #0071c2"
                          : "1px solid #d0d5dd",
                      background: sortBy === opt.value ? "#e8f0fe" : "#fff",
                      color: sortBy === opt.value ? "#0071c2" : "#333",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category cards grid (top) */}
            {categoryCards.length > 0 && !activeCategory && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                {categoryCards.map((card) => (
                  <button
                    key={card.category}
                    onClick={() =>
                      navigate(buildLink(citySlug, card.category, activeQuery))
                    }
                    style={{
                      border: "1px solid #e7e7e7",
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "#fff",
                      padding: 0,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.boxShadow =
                        "0 4px 16px rgba(0,0,0,0.12)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.boxShadow = "none")
                    }
                  >
                    <img
                      src={card.image}
                      alt={card.category}
                      style={{
                        width: "100%",
                        height: 110,
                        objectFit: "cover",
                        display: "block",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://picsum.photos/seed/${card.category}/400/220`;
                      }}
                    />
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>
                        {card.category}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#595959", marginTop: 2 }}
                      >
                        {card.count} карточек в подборке
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Attraction list */}
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 160,
                    background: "#f0f0f0",
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                />
              ))
            ) : visibleItems.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: "#888",
                }}
              >
                <p style={{ fontSize: 18 }}>
                  Ничего не найдено по заданным фильтрам.
                </p>
                <button
                  onClick={() => {
                    setFreeCancel(false);
                    setAvailableToday(false);
                    setGenius(false);
                    setPriceLimit(maxPrice);
                    router.push(`/attractions/${citySlug}`);
                  }}
                  style={{
                    marginTop: 16,
                    padding: "10px 24px",
                    background: "#0071c2",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              visibleItems.map((item) => (
                <article
                  key={item.id}
                  style={{
                    background: "#fff",
                    border: "1px solid #e7e7e7",
                    borderRadius: 8,
                    marginBottom: 16,
                    overflow: "hidden",
                    transition: "box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(0,0,0,0.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow = "none")
                  }
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "var(--attr-card-cols, 200px 1fr auto)" /* attr-card-grid */,
                      gap: 0,
                    }}
                  >
                    {/* Image */}
                    <div style={{ position: "relative" }}>
                      <img
                        src={item.image_url}
                        alt={item.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          minHeight: 160,
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://picsum.photos/seed/${item.id}/400/300`;
                        }}
                      />
                      <button
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.9)",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Heart size={16} color="#555" />
                      </button>
                    </div>

                    {/* Info */}
                    <div style={{ padding: "16px 20px" }}>
                      {/* Badges */}
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          flexWrap: "wrap",
                          marginBottom: 8,
                        }}
                      >
                        {(item as any).bestseller_rank && (
                          <span
                            style={{
                              background: "#fff4d5",
                              color: "#8a5a00",
                              fontSize: 11,
                              fontWeight: 800,
                              padding: "3px 8px",
                              borderRadius: 3,
                            }}
                          >
                            № {(item as any).bestseller_rank} по популярности
                          </span>
                        )}
                        {item.badge && (
                          <span
                            style={{
                              background: "#fff4d5",
                              color: "#8a5a00",
                              fontSize: 11,
                              fontWeight: 800,
                              padding: "3px 8px",
                              borderRadius: 3,
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                        {(item as any).is_genius && (
                          <span
                            style={{
                              background: "#003580",
                              color: "#febb02",
                              fontSize: 11,
                              fontWeight: 900,
                              padding: "3px 8px",
                              borderRadius: 3,
                            }}
                          >
                            Genius
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <div
                        onClick={() =>
                          navigate(`/attractions/detail/${item.id}`)
                        }
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: "#0071c2",
                          marginBottom: 4,
                          cursor: "pointer",
                          lineHeight: 1.3,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.textDecoration = "underline")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.textDecoration = "none")
                        }
                      >
                        {item.name}
                      </div>

                      {/* Location */}
                      {item.city && (
                        <div
                          style={{
                            fontSize: 13,
                            color: "#595959",
                            marginBottom: 10,
                          }}
                        >
                          {item.city}
                          {item.country ? `, ${item.country}` : ""}
                        </div>
                      )}

                      {/* Description */}
                      {item.description && (
                        <div
                          style={{
                            fontSize: 13,
                            color: "#333",
                            lineHeight: 1.5,
                            marginBottom: 12,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {item.description}
                        </div>
                      )}

                      {/* Meta */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        {item.duration_hours > 0 && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              color: "#595959",
                              fontSize: 13,
                            }}
                          >
                            <Clock3 size={14} />
                            <span>
                              Продолжительность:{" "}
                              {(item as any).duration_label ||
                                `${item.duration_hours} ч.`}
                            </span>
                          </div>
                        )}
                        {item.rating > 0 && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: 13,
                            }}
                          >
                            <Star size={14} fill="#febb02" color="#febb02" />
                            <span style={{ fontWeight: 700 }}>
                              {Number(item.rating).toFixed(1)}
                            </span>
                            <span style={{ color: "#595959" }}>
                              {(item as any).rating_label} (
                              {(item.reviews_count || 0).toLocaleString(
                                "ru-RU",
                              )}{" "}
                              отзывов)
                            </span>
                          </div>
                        )}
                        {item.free_cancel && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              color: "#008234",
                              fontSize: 13,
                            }}
                          >
                            <Ticket size={14} />
                            <span>Доступна бесплатная отмена</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price + Button */}
                    <div
                      style={{
                        padding: "16px 20px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        minWidth: 200,
                        borderLeft: "1px solid #f0f0f0",
                      }}
                    >
                      <div style={{ textAlign: "right" }}>
                        {(item as any).original_price > item.price && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "#888",
                              textDecoration: "line-through",
                              marginBottom: 2,
                            }}
                          >
                            От {formatPrice((item as any).original_price)}
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: 13,
                            color: "#595959",
                            marginBottom: 2,
                          }}
                        >
                          От
                        </div>
                        <div
                          style={{
                            fontSize: 26,
                            fontWeight: 900,
                            color: "#1a1a1a",
                            lineHeight: 1,
                          }}
                        >
                          {formatPrice(item.price)}
                        </div>
                        <div
                          style={{ fontSize: 11, color: "#888", marginTop: 4 }}
                        >
                          Включая налоги и сборы
                        </div>
                        {(item as any).available_today && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "#008234",
                              fontWeight: 700,
                              marginTop: 6,
                            }}
                          >
                            Доступно с сегодняшнего дня
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          navigate(`/attractions/detail/${item.id}`)
                        }
                        style={{
                          marginTop: 16,
                          padding: "12px 20px",
                          background: "#0071c2",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          width: "100%",
                          justifyContent: "center",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#005fa3")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#0071c2")
                        }
                      >
                        Посмотреть наличие мест →
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
