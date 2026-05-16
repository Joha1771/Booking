import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  ChevronDown,
  Info,
  LoaderCircle,
  Plane,
  Search,
  Share2,
  Users,
} from "lucide-react";
import Header from "../../components/layout/Header.jsx";
import Footer from "../../components/layout/Footer.jsx";
import {
  useFlightAirports,
  useFlightRoutes,
  useFlights,
} from "../hooks/useFlights.js";

const AIRLINE_STYLES = {
  "Centrum Air": { abbr: "CA", bg: "#003580" },
  "Uzbekistan Airways": { abbr: "HY", bg: "#00a550" },
  flydubai: { abbr: "FZ", bg: "#e31837" },
  "Hahn Air": { abbr: "HR", bg: "#1e3a8a" },
  Emirates: { abbr: "EK", bg: "#c8102e" },
  "Qatar Airways": { abbr: "QR", bg: "#5c0632" },
  "Azerbaijan Airlines": { abbr: "J2", bg: "#0057b7" },
  "Air Arabia": { abbr: "G9", bg: "#cc0000" },
  "Turkish Airlines": { abbr: "TK", bg: "#e21a22" },
  "Etihad Airways": { abbr: "EY", bg: "#7c5a21" },
  "Pegasus Airlines": { abbr: "PC", bg: "#f97316" },
};

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function formatCurrency(value) {
  return `UZS ${Math.round(Number(value || 0)).toLocaleString("ru-RU")}`;
}

function formatAirportLabel(airport) {
  return airport ? `${airport.city} (${airport.code})` : "";
}

function resolveAirport(value, airports) {
  if (!value || !airports?.length) return null;

  const codeMatch = String(value).match(/\(([A-Z]{3})\)/);
  if (codeMatch) {
    const matchedByCode = airports.find(
      (airport) => airport.code === codeMatch[1],
    );
    if (matchedByCode) return matchedByCode;
  }

  const normalizedValue = normalizeText(value);
  return (
    airports.find(
      (airport) =>
        normalizeText(airport.code) === normalizedValue ||
        normalizeText(airport.city) === normalizedValue ||
        normalizeText(formatAirportLabel(airport)) === normalizedValue ||
        normalizeText(airport.name).includes(normalizedValue),
    ) || null
  );
}

function durationToMinutes(value) {
  const text = String(value || "");
  const hours = Number(text.match(/(\d+)\s*(?:h|ч)/i)?.[1] || 0);
  const minutes = Number(text.match(/(\d+)\s*(?:m|м)/i)?.[1] || 0);
  return hours * 60 + minutes;
}

function stopBucket(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("nonstop") || text.includes("без перес")) return "nonstop";
  if (
    text.includes("2") ||
    text.includes("3") ||
    text.includes("+") ||
    text.includes("stops")
  ) {
    return text.includes("1 stop") ? "one" : "two";
  }
  if (text.includes("stop") || text.includes("перес")) return "one";
  return "nonstop";
}

function itineraryBucket(flight) {
  const buckets = [stopBucket(flight.out.stops), stopBucket(flight.back.stops)];
  if (buckets.includes("two")) return "two";
  if (buckets.includes("one")) return "one";
  return "nonstop";
}

function totalDurationMinutes(flight) {
  return (
    durationToMinutes(flight.out.duration) +
    durationToMinutes(flight.back.duration)
  );
}

function AirlineLogo({ airline }) {
  const info = AIRLINE_STYLES[airline] || {
    abbr: airline?.slice(0, 2)?.toUpperCase() || "??",
    bg: "#6b7280",
  };

  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: info.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 800,
        fontSize: 11,
        flexShrink: 0,
      }}
    >
      {info.abbr}
    </div>
  );
}

function FlightLeg({ title, leg }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 0.8fr)",
        gap: 14,
        alignItems: "center",
        padding: "14px 0",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}
      >
        <AirlineLogo airline={leg.airline} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>
            {title}
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>
            {leg.dep} – {leg.arr}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#4b5563",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {leg.airline}
          </div>
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: leg.stops === "nonstop" ? "#111827" : "#b45309",
            marginBottom: 2,
          }}
        >
          {leg.stops}
        </div>
        {leg.stopCity && (
          <div style={{ fontSize: 12, color: "#6b7280" }}>{leg.stopCity}</div>
        )}
      </div>

      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{leg.duration}</div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>{leg.route}</div>
      </div>
    </div>
  );
}

function AirportSuggest({
  label,
  value,
  onChange,
  airports,
  placeholder,
  loading = false,
}) {
  const [open, setOpen] = useState(false);
  const normalizedValue = normalizeText(value);

  useEffect(() => {
    if (!open) return undefined;

    const handleClick = (event) => {
      if (!event.target.closest?.("[data-airport-suggest]")) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const filteredAirports = useMemo(() => {
    if (!normalizedValue) return airports.slice(0, 8);

    return airports
      .filter((airport) => {
        const haystack = `${airport.city} ${airport.code} ${airport.name} ${airport.country}`;
        return normalizeText(haystack).includes(normalizedValue);
      })
      .slice(0, 8);
  }, [airports, normalizedValue]);

  return (
    <div
      data-airport-suggest
      style={{ flex: 1, minWidth: 210, position: "relative" }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          border: "1px solid #d1d5db",
          padding: "10px 14px",
          boxShadow: open ? "0 0 0 2px rgba(0, 113, 194, 0.12)" : "none",
        }}
      >
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>
          {label}
        </div>
        <input
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            fontSize: 14,
            fontWeight: 600,
            background: "transparent",
          }}
        />
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            width: "100%",
            minWidth: 320,
            maxHeight: 320,
            overflowY: "auto",
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            boxShadow: "0 14px 34px rgba(15, 23, 42, 0.16)",
            zIndex: 50,
          }}
        >
          {loading ? (
            <div
              style={{
                padding: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "#6b7280",
              }}
            >
              <LoaderCircle size={14} className="animate-spin" /> Загружаем
              аэропорты…
            </div>
          ) : filteredAirports.length ? (
            filteredAirports.map((airport) => (
              <button
                key={airport.code}
                onMouseDown={() => {
                  onChange(formatAirportLabel(airport));
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid #f3f4f6",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    minWidth: 42,
                    height: 28,
                    borderRadius: 6,
                    background: "#003580",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {airport.code}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {airport.city}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {airport.name}, {airport.country}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div style={{ padding: 14, fontSize: 13, color: "#6b7280" }}>
              Ничего не найдено
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SearchPanel({
  compact = false,
  from,
  to,
  setFrom,
  setTo,
  onSwap,
  onSearch,
  airports,
  airportsLoading,
  routeSuggestions,
  tripType,
  setTripType,
  adults,
  setAdults,
  cabinClass,
  setCabinClass,
}) {
  return (
    <div
      style={{
        background: compact ? "transparent" : "#fff",
        borderRadius: compact ? 0 : 18,
        padding: compact ? 0 : 18,
        boxShadow: compact ? "none" : "0 14px 34px rgba(15, 23, 42, 0.12)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setTripType(tripType === "round" ? "oneway" : "round")}
          style={{
            border: "none",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            fontSize: compact ? 13 : 14,
            fontWeight: 600,
            color: compact ? "#111827" : "#1f2937",
            padding: 0,
          }}
        >
          {tripType === "round" ? "Round-trip" : "One way"}
          <ChevronDown size={14} />
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#4b5563",
            fontSize: 13,
          }}
        >
          <Users size={14} />
          <input
            type="number"
            min={1}
            max={9}
            value={adults}
            onChange={(event) =>
              setAdults(Math.max(1, Number(event.target.value) || 1))
            }
            style={{
              width: 52,
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "4px 8px",
            }}
          />
          <select
            value={cabinClass}
            onChange={(event) => setCabinClass(event.target.value)}
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "4px 8px",
            }}
          >
            <option>Economy</option>
            <option>Premium Economy</option>
            <option>Business</option>
            <option>First</option>
          </select>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <AirportSuggest
          label="From"
          value={from}
          onChange={setFrom}
          airports={airports}
          placeholder="Tashkent (TAS)"
          loading={airportsLoading}
        />

        <button
          onClick={onSwap}
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            border: "1px solid #d1d5db",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <ArrowLeftRight size={16} color="#4b5563" />
        </button>

        <AirportSuggest
          label="To"
          value={to}
          onChange={setTo}
          airports={airports}
          placeholder="Dubai (DXB)"
          loading={airportsLoading}
        />

        <button
          onClick={onSearch}
          style={{
            minWidth: 152,
            height: 48,
            borderRadius: 12,
            border: "none",
            background: "#0071c2",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <Search size={16} /> Search
        </button>
      </div>

      {!compact && routeSuggestions.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#6b7280",
              marginBottom: 8,
            }}
          >
            Популярные направления
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {routeSuggestions.map((route) => (
              <button
                key={route.id}
                onClick={() => setTo(`${route.toCity} (${route.toCode})`)}
                style={{
                  border: "1px solid #dbeafe",
                  background: "#f8fbff",
                  color: "#003580",
                  borderRadius: 999,
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontSize: 13,
                  textAlign: "left",
                }}
              >
                <div style={{ fontWeight: 700 }}>{route.routeLabel}</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>
                  от {formatCurrency(route.samplePrice)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarSection({ title, children }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 16,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function ResultCard({ flight, onSelect }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        overflow: "hidden",
        transition: "box-shadow 0.18s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "stretch", flexWrap: "wrap" }}>
        <div
          style={{
            width: 60,
            borderRight: "1px solid #f3f4f6",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: 18,
            flexShrink: 0,
          }}
        >
          <button
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Share2 size={13} color="#6b7280" />
          </button>
        </div>

        <div style={{ flex: 1, padding: "4px 18px", minWidth: 340 }}>
          <FlightLeg title="Outbound" leg={flight.out} />
          <div style={{ height: 1, background: "#f3f4f6" }} />
          <FlightLeg title="Return" leg={flight.back} />
        </div>

        <div
          style={{
            width: 210,
            borderLeft: "1px solid #f3f4f6",
            padding: 18,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-end",
            flexShrink: 0,
          }}
        >
          {flight.tags.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 10,
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              {flight.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: tag === "Best" ? "#0071c2" : "#00a550",
                    color: "#fff",
                    borderRadius: 999,
                    padding: "4px 9px",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 2 }}>
            {formatCurrency(flight.price)}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>
            {flight.cabin}
          </div>
          <button
            onClick={onSelect}
            style={{
              width: "100%",
              border: "none",
              borderRadius: 12,
              background: "#0071c2",
              color: "#fff",
              padding: "11px 0",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FlightsPage() {
  const navigate = useNavigate();
  const [searched, setSearched] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [tripType, setTripType] = useState("round");
  const [adults, setAdults] = useState(1);
  const [cabinClass, setCabinClass] = useState("Economy");
  const [sortBy, setSortBy] = useState("best");
  const [visibleCount, setVisibleCount] = useState(8);
  const [stopsFilter, setStopsFilter] = useState({
    nonstop: true,
    one: true,
    two: true,
  });
  const [selectedAirlines, setSelectedAirlines] = useState({});

  const { data: airports = [], isLoading: airportsLoading } =
    useFlightAirports("");
  const fromAirport = useMemo(
    () => resolveAirport(from, airports),
    [from, airports],
  );
  const toAirport = useMemo(() => resolveAirport(to, airports), [to, airports]);
  const { data: routeSuggestions = [] } = useFlightRoutes({
    fromCode: fromAirport?.code || "TAS",
  });
  const { data: flights = [], isLoading: flightsLoading } = useFlights({
    fromCode: fromAirport?.code,
    toCode: toAirport?.code,
  });

  useEffect(() => {
    if (from || !airports.length) return;
    setFrom(
      formatAirportLabel(
        airports.find((airport) => airport.code === "TAS") || airports[0],
      ),
    );
  }, [airports, from]);

  useEffect(() => {
    if (to || !routeSuggestions.length) return;
    setTo(`${routeSuggestions[0].toCity} (${routeSuggestions[0].toCode})`);
  }, [routeSuggestions, to]);

  const airlineOptions = useMemo(
    () =>
      [
        ...new Set(
          flights
            .flatMap((flight) => [flight.out.airline, flight.back.airline])
            .filter(Boolean),
        ),
      ].sort(),
    [flights],
  );

  useEffect(() => {
    if (!airlineOptions.length) return;
    setSelectedAirlines((current) => {
      const next = {};
      airlineOptions.forEach((airline) => {
        next[airline] = current[airline] ?? true;
      });
      return next;
    });
  }, [airlineOptions]);

  const stopStats = useMemo(
    () =>
      flights.reduce(
        (stats, flight) => {
          const bucket = itineraryBucket(flight);
          stats[bucket].count += 1;
          stats[bucket].minPrice = Math.min(
            stats[bucket].minPrice,
            flight.price,
          );
          return stats;
        },
        {
          nonstop: { count: 0, minPrice: Number.POSITIVE_INFINITY },
          one: { count: 0, minPrice: Number.POSITIVE_INFINITY },
          two: { count: 0, minPrice: Number.POSITIVE_INFINITY },
        },
      ),
    [flights],
  );

  const filteredFlights = useMemo(() => {
    return flights
      .filter((flight) => {
        const bucket = itineraryBucket(flight);
        if (!stopsFilter[bucket]) return false;
        return [flight.out.airline, flight.back.airline].every(
          (airline) => selectedAirlines[airline] ?? true,
        );
      })
      .sort((left, right) => {
        if (sortBy === "cheapest") return left.price - right.price;
        if (sortBy === "quickest")
          return totalDurationMinutes(left) - totalDurationMinutes(right);
        const bestLeft = left.tags.includes("Best") ? -1 : 0;
        const bestRight = right.tags.includes("Best") ? -1 : 0;
        if (bestLeft !== bestRight) return bestLeft - bestRight;
        return left.price - right.price;
      });
  }, [flights, selectedAirlines, sortBy, stopsFilter]);

  const cheapestPrice = filteredFlights.length
    ? Math.min(...filteredFlights.map((flight) => flight.price))
    : 0;
  const quickestFlight = filteredFlights.length
    ? [...filteredFlights].sort(
        (left, right) =>
          totalDurationMinutes(left) - totalDurationMinutes(right),
      )[0]
    : null;
  const destinationAirports = useMemo(
    () =>
      [...new Set(flights.map((flight) => flight.toCode))]
        .map((code) => airports.find((airport) => airport.code === code))
        .filter(Boolean),
    [airports, flights],
  );

  const handleSwap = () => {
    const previousFrom = from;
    setFrom(to);
    setTo(previousFrom);
  };

  const handleSearch = () => {
    if (!from && airports.length)
      setFrom(
        formatAirportLabel(
          airports.find((airport) => airport.code === "TAS") || airports[0],
        ),
      );
    if (!to && routeSuggestions.length)
      setTo(`${routeSuggestions[0].toCity} (${routeSuggestions[0].toCode})`);
    setVisibleCount(8);
    setSearched(true);
  };

  if (!searched) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <Header />
        <section
          style={{
            background: "linear-gradient(135deg, #e8f0f8 0%, #f8fbff 100%)",
            padding: "40px 0 56px",
          }}
        >
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 16px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.15fr) minmax(280px, 0.85fr)",
                gap: 24,
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#fff",
                    color: "#003580",
                    borderRadius: 999,
                    padding: "8px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 14,
                    border: "1px solid #dbeafe",
                  }}
                >
                  <Plane size={14} /> Booking-inspired flights search
                </div>
                <h1
                  style={{
                    fontSize: 40,
                    lineHeight: 1.1,
                    fontWeight: 900,
                    color: "#111827",
                    marginBottom: 12,
                  }}
                >
                  Search hundreds of flight sites at once.
                </h1>
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: "#4b5563",
                    maxWidth: 700,
                    marginBottom: 22,
                  }}
                >
                  Направления и авиабилеты теперь загружаются из Supabase:
                  аэропорты, популярные маршруты и сами рейсы больше не
                  захардкожены внутри страницы.
                </p>

                <SearchPanel
                  from={from}
                  to={to}
                  setFrom={setFrom}
                  setTo={setTo}
                  onSwap={handleSwap}
                  onSearch={handleSearch}
                  airports={airports}
                  airportsLoading={airportsLoading}
                  routeSuggestions={routeSuggestions}
                  tripType={tripType}
                  setTripType={setTripType}
                  adults={adults}
                  setAdults={setAdults}
                  cabinClass={cabinClass}
                  setCabinClass={setCabinClass}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gridTemplateRows: "170px 170px",
                  gap: 12,
                }}
              >
                {[
                  "https://content.r9cdn.net/frontier-experimental/assets/C4mMXIMv2W.png",
                  "https://content.r9cdn.net/frontier-experimental/assets/B78-YSGPh-.png",
                  "https://content.r9cdn.net/frontier-experimental/assets/BAWXupsgkG.png",
                  "https://content.r9cdn.net/frontier-experimental/assets/D9SjeOszg-.png",
                ].map((src, index) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius:
                        index === 0
                          ? "18px 8px 8px 8px"
                          : index === 1
                            ? "8px 18px 8px 8px"
                            : index === 2
                              ? "8px 8px 8px 18px"
                              : "8px 8px 18px 8px",
                      boxShadow: "0 10px 24px rgba(15, 23, 42, 0.12)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "28px 16px 48px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 16,
            }}
          >
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 18,
              }}
            >
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                Аэропортов в базе
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#111827" }}>
                {airports.length}
              </div>
            </div>
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 18,
              }}
            >
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                Популярных направлений
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#111827" }}>
                {routeSuggestions.length}
              </div>
            </div>
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 18,
              }}
            >
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                Минимальная цена
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#111827" }}>
                {cheapestPrice ? formatCurrency(cheapestPrice) : "—"}
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <Header />
      <div
        style={{
          background: "#febb02",
          borderTop: "3px solid #003580",
          padding: "10px 0",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 16px" }}>
          <SearchPanel
            compact
            from={from}
            to={to}
            setFrom={setFrom}
            setTo={setTo}
            onSwap={handleSwap}
            onSearch={handleSearch}
            airports={airports}
            airportsLoading={airportsLoading}
            routeSuggestions={routeSuggestions}
            tripType={tripType}
            setTripType={setTripType}
            adults={adults}
            setAdults={setAdults}
            cabinClass={cabinClass}
            setCabinClass={setCabinClass}
          />
        </div>
      </div>

      <div
        style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 16px 40px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "290px minmax(0, 1fr)",
            gap: 18,
            alignItems: "start",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              position: "sticky",
              top: 86,
            }}
          >
            <SidebarSection title="Stops">
              {[
                { key: "nonstop", label: "Nonstop" },
                { key: "one", label: "1 stop" },
                { key: "two", label: "2+ stops" },
              ].map((item) => {
                const stats = stopStats[item.key];
                const priceLabel = Number.isFinite(stats.minPrice)
                  ? formatCurrency(stats.minPrice)
                  : null;
                return (
                  <label
                    key={item.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 13,
                      marginBottom: 10,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={stopsFilter[item.key]}
                      onChange={(event) =>
                        setStopsFilter((current) => ({
                          ...current,
                          [item.key]: event.target.checked,
                        }))
                      }
                    />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <span style={{ color: "#6b7280" }}>{stats.count}</span>
                    {priceLabel && (
                      <span style={{ color: "#6b7280", fontSize: 12 }}>
                        {priceLabel}
                      </span>
                    )}
                  </label>
                );
              })}
            </SidebarSection>

            <SidebarSection title="Airlines">
              {airlineOptions.map((airline) => (
                <label
                  key={airline}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 13,
                    marginBottom: 10,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedAirlines[airline] ?? true}
                    onChange={(event) =>
                      setSelectedAirlines((current) => ({
                        ...current,
                        [airline]: event.target.checked,
                      }))
                    }
                  />
                  <AirlineLogo airline={airline} />
                  <span>{airline}</span>
                </label>
              ))}
            </SidebarSection>

            <SidebarSection title="Airports">
              <div style={{ fontSize: 13, color: "#111827", marginBottom: 12 }}>
                <strong>From:</strong>{" "}
                {fromAirport
                  ? `${fromAirport.city} (${fromAirport.code})`
                  : "—"}
              </div>
              {destinationAirports.length ? (
                destinationAirports.map((airport) => (
                  <div
                    key={airport.code}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      marginBottom: 8,
                    }}
                  >
                    <span>{airport.city}</span>
                    <span style={{ color: "#6b7280" }}>{airport.code}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  Нет доступных аэропортов назначения
                </div>
              )}
            </SidebarSection>
          </div>

          <div>
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: "14px 16px",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
              }}
            >
              <Info size={16} color="#0071c2" style={{ flexShrink: 0 }} />
              Направления и результаты для этой страницы загружаются из
              Supabase. Чтобы добавить новые города — достаточно обновить SQL
              seed, без правок JSX.
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                marginBottom: 14,
                display: "flex",
                overflow: "hidden",
                flexWrap: "wrap",
              }}
            >
              {[
                {
                  key: "best",
                  label: "Best",
                  value: cheapestPrice ? formatCurrency(cheapestPrice) : "—",
                },
                {
                  key: "cheapest",
                  label: "Cheapest",
                  value: cheapestPrice ? formatCurrency(cheapestPrice) : "—",
                },
                {
                  key: "quickest",
                  label: "Quickest",
                  value: quickestFlight
                    ? formatCurrency(quickestFlight.price)
                    : "—",
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSortBy(tab.key)}
                  style={{
                    flex: 1,
                    minWidth: 180,
                    border: "none",
                    borderBottom:
                      sortBy === tab.key
                        ? "3px solid #0071c2"
                        : "3px solid transparent",
                    background: "transparent",
                    textAlign: "left",
                    padding: "14px 18px",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: sortBy === tab.key ? 800 : 600,
                      color: sortBy === tab.key ? "#0071c2" : "#111827",
                    }}
                  >
                    {tab.label}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                    {tab.value}
                  </div>
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 12, fontSize: 13, color: "#4b5563" }}>
              {fromAirport ? fromAirport.city : "Origin"} →{" "}
              {toAirport ? toAirport.city : "Destination"} ·{" "}
              {filteredFlights.length} results
            </div>

            {flightsLoading ? (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: 24,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "#6b7280",
                }}
              >
                <LoaderCircle size={18} className="animate-spin" /> Загружаем
                рейсы из Supabase…
              </div>
            ) : filteredFlights.length === 0 ? (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                  По этому направлению пока нет результатов
                </div>
                <div style={{ fontSize: 14, color: "#6b7280" }}>
                  Попробуйте выбрать другое направление из блока популярных
                  маршрутов или добавьте новые записи в таблицы flight_routes и
                  flights.
                </div>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {filteredFlights.slice(0, visibleCount).map((flight) => (
                  <ResultCard
                    key={flight.id}
                    flight={flight}
                    onSelect={() => navigate(`/checkout/${flight.id}`)}
                  />
                ))}
                {visibleCount < filteredFlights.length ? (
                  <button
                    onClick={() => setVisibleCount((current) => current + 6)}
                    style={{
                      marginTop: 8,
                      border: "none",
                      borderRadius: 14,
                      background: "#111827",
                      color: "#fff",
                      padding: "14px 18px",
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Show more results
                  </button>
                ) : (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: "#6b7280",
                      lineHeight: 1.6,
                    }}
                  >
                    Prices are per person and may vary depending on baggage,
                    fare rules and the final booking site.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
