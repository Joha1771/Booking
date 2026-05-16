import { Clock, MapPin } from "lucide-react";
import {
  useSearchDestinations,
  useTrendingDestinations,
} from "../../hooks/useQueries.js";
import useSearchStore from "../store/useSearchStore.js";

// Static recent — could be from localStorage later
const RECENT_SEARCHES = [
  {
    city: "Ургенч",
    country: "Узбекистан",
    dates: "19 мая — 17 июня, 3 взрослых, 1 ребёнок",
  },
];

function Row({ icon: Icon, title, subtitle, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 16px",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          background: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={16} color="#666" />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--booking-text-light)" }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}

export default function DestinationDropdown({ onSelect }) {
  const { destination } = useSearchStore();
  const { data: searchResults, isLoading } = useSearchDestinations(destination);
  const { data: trending } = useTrendingDestinations();

  const showSearch = destination && destination.length >= 2;
  const items = showSearch ? searchResults || [] : [];

  // Popular from Supabase, fallback to static
  const popular = trending?.slice(0, 5) || [
    { name: "Ташкент", country: "Узбекистан" },
    { name: "Самарканд", country: "Узбекистан" },
    { name: "Бухара", country: "Узбекистан" },
    { name: "Хива", country: "Узбекистан" },
    { name: "Стамбул", country: "Турция" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 4px)",
        left: 0,
        width: 340,
        background: "#fff",
        borderRadius: 4,
        boxShadow: "0 2px 16px rgba(0,0,0,0.25)",
        zIndex: 1000,
        paddingBottom: 8,
      }}
    >
      {showSearch ? (
        <>
          {isLoading && (
            <div
              style={{
                padding: "12px 16px",
                fontSize: 13,
                color: "var(--booking-text-light)",
              }}
            >
              Поиск...
            </div>
          )}
          {items.map((dest, i) => (
            <Row
              key={i}
              icon={MapPin}
              title={dest.name}
              subtitle={dest.country}
              onClick={() => onSelect(dest.name)}
            />
          ))}
          {!isLoading && items.length === 0 && (
            <div
              style={{
                padding: "12px 16px",
                fontSize: 13,
                color: "var(--booking-text-light)",
              }}
            >
              Ничего не найдено
            </div>
          )}
        </>
      ) : (
        <>
          <div
            style={{ padding: "12px 16px 4px", fontWeight: 700, fontSize: 13 }}
          >
            Вы недавно искали
          </div>
          {RECENT_SEARCHES.map((s, i) => (
            <Row
              key={i}
              icon={Clock}
              title={s.city}
              subtitle={s.dates}
              onClick={() => onSelect(s.city)}
            />
          ))}
          <div
            style={{ padding: "12px 16px 4px", fontWeight: 700, fontSize: 13 }}
          >
            Популярные направления
          </div>
          {popular.map((s, i) => (
            <Row
              key={i}
              icon={MapPin}
              title={s.name}
              subtitle={s.country}
              onClick={() => onSelect(s.name)}
            />
          ))}
        </>
      )}
    </div>
  );
}
