"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  ArrowLeftRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  LoaderCircle,
  Minus,
  Plane,
  Plus,
  Search,
  Share2,
  Users,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  useFlightAirports,
  useFlightRoutes,
  useFlights,
} from "../hooks/useFlights";

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
  "Air Astana": { abbr: "KC", bg: "#0f766e" },
};

const HERO_IMAGES = [
  "https://content.r9cdn.net/frontier-experimental/assets/C4mMXIMv2W.png",
  "https://content.r9cdn.net/frontier-experimental/assets/B78-YSGPh-.png",
  "https://content.r9cdn.net/frontier-experimental/assets/BAWXupsgkG.png",
  "https://content.r9cdn.net/frontier-experimental/assets/D9SjeOszg-.png",
];

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

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function formatDateLabel(value) {
  if (!value) return "Выберите дату";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatDateRangeLabel(departDate, returnDate, tripType) {
  if (!departDate) return "Даты не выбраны";
  if (tripType === "oneway" || !returnDate) return formatDateLabel(departDate);
  return `${formatDateLabel(departDate)} — ${formatDateLabel(returnDate)}`;
}

function formatBookingShortDate(value) {
  if (!value) return "Select date";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);

  const weekday = parts.find((part) => part.type === "weekday")?.value || "";
  const month = parts.find((part) => part.type === "month")?.value || "";
  const day = parts.find((part) => part.type === "day")?.value || "";

  return `${weekday} ${month}/${day}`;
}

function getTravelerSummary(adults, cabinClass) {
  const adultLabel = adults === 1 ? "adult" : "adults";
  return `${adults} ${adultLabel}, ${cabinClass}`;
}

function getTravelerPanelSummary(adults, children, infants, cabinClass) {
  const parts = [];
  if (adults > 0) parts.push(`${adults} ${adults === 1 ? "adult" : "adults"}`);
  if (children > 0)
    parts.push(`${children} ${children === 1 ? "child" : "children"}`);
  if (infants > 0)
    parts.push(`${infants} ${infants === 1 ? "infant" : "infants"}`);

  return `${parts.join(", ") || "1 adult"}, ${cabinClass}`;
}

function getMonthTitle(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getMonthMatrix(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return Array.from({ length: cells.length / 7 }, (_, index) =>
    cells.slice(index * 7, index * 7 + 7),
  );
}

function isSameDay(left, right) {
  if (!left || !right) return false;
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function isDayWithinRange(day, start, end) {
  if (!day || !start || !end) return false;
  const time = day.setHours(0, 0, 0, 0);
  const startTime = start.setHours(0, 0, 0, 0);
  const endTime = end.setHours(0, 0, 0, 0);
  return (
    time >= Math.min(startTime, endTime) && time <= Math.max(startTime, endTime)
  );
}

function AirlineLogo({ airline, size = 38 }) {
  const info = AIRLINE_STYLES[airline] || {
    abbr: airline?.slice(0, 2)?.toUpperCase() || "??",
    bg: "#6b7280",
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: info.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 800,
        fontSize: size <= 30 ? 10 : 11,
        flexShrink: 0,
      }}
    >
      {info.abbr}
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
  compact = false,
  bookingMode = false,
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const normalizedValue = normalizeText(value);
  const showChip = bookingMode && value && !open;

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
    if (!normalizedValue) return airports.slice(0, compact ? 6 : 8);

    return airports
      .filter((airport) => {
        const haystack = `${airport.city} ${airport.code} ${airport.name} ${airport.country}`;
        return normalizeText(haystack).includes(normalizedValue);
      })
      .slice(0, compact ? 6 : 8);
  }, [airports, compact, normalizedValue]);

  return (
    <div
      data-airport-suggest
      style={{ flex: 1, minWidth: compact ? 220 : 220, position: "relative" }}
    >
      <div
        style={{
          background: bookingMode ? "transparent" : "#fff",
          borderRadius: bookingMode ? 0 : compact ? 10 : 14,
          border: bookingMode
            ? "none"
            : open
              ? "2px solid #003b95"
              : "1px solid #d1d5db",
          padding: bookingMode ? "0 12px" : compact ? "10px 12px" : "12px 14px",
          minHeight: bookingMode ? 52 : compact ? 64 : 76,
          display: "flex",
          flexDirection: bookingMode ? "row" : "column",
          justifyContent: "center",
          alignItems: bookingMode ? "center" : undefined,
          gap: bookingMode ? 8 : 0,
          boxShadow: open ? "0 0 0 4px rgba(0, 113, 194, 0.12)" : "none",
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {!bookingMode && (
          <div
            style={{
              fontSize: 11,
              color: "#6b7280",
              marginBottom: 4,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.2,
            }}
          >
            {label}
          </div>
        )}
        {showChip && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              maxWidth: "100%",
              border: "1px solid #d1d5db",
              background: "#eef2f7",
              borderRadius: 8,
              padding: "7px 10px",
              fontSize: 13,
              fontWeight: 500,
              color: "#374151",
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {value}
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onChange("");
                setOpen(true);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                color: "#4b5563",
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        )}
        <input
          ref={inputRef}
          value={showChip ? "" : value}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          placeholder={showChip ? "" : placeholder}
          style={{
            width: bookingMode ? (showChip ? 12 : "100%") : "100%",
            flex: bookingMode ? 1 : undefined,
            minWidth: bookingMode ? 12 : undefined,
            border: "none",
            outline: "none",
            fontSize: bookingMode ? 14 : compact ? 14 : 16,
            fontWeight: bookingMode ? 500 : 700,
            background: "transparent",
            color: "#111827",
            padding: 0,
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
            borderRadius: 14,
            border: "1px solid #dbe3ec",
            boxShadow: "0 18px 42px rgba(15, 23, 42, 0.18)",
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
                    minWidth: 44,
                    height: 30,
                    borderRadius: 8,
                    background: "#003580",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {airport.code}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}
                  >
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

function BookingDateDisplay({ value, onChange, align = "left" }) {
  return (
    <label
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        justifyContent: align === "right" ? "flex-end" : "flex-start",
      }}
    >
      <span style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
        {formatBookingShortDate(value)}
      </span>
      <CalendarDays size={16} color="#4b5563" />
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          cursor: "pointer",
        }}
      />
    </label>
  );
}

function DateField({
  label,
  value,
  onChange,
  compact = false,
  disabled = false,
}) {
  return (
    <div style={{ flex: 1, minWidth: compact ? 160 : 180 }}>
      <div
        style={{
          background: disabled ? "#f3f4f6" : "#fff",
          borderRadius: compact ? 10 : 14,
          border: "1px solid #d1d5db",
          padding: compact ? "10px 12px" : "12px 14px",
          minHeight: compact ? 64 : 76,
          display: "flex",
          alignItems: "center",
          gap: 10,
          opacity: disabled ? 0.7 : 1,
        }}
      >
        <CalendarDays size={18} color="#6b7280" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              color: "#6b7280",
              marginBottom: 4,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
          <input
            type="date"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: compact ? 14 : 16,
              fontWeight: 700,
              color: "#111827",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function BookingLocationPopover({
  airports,
  loading,
  query,
  onSelect,
  recentSearch,
  onRecentSelect,
}) {
  const filteredAirports = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return airports.slice(0, 7);

    return airports
      .filter((airport) => {
        const haystack = `${airport.city} ${airport.code} ${airport.name} ${airport.country}`;
        return normalizeText(haystack).includes(normalizedQuery);
      })
      .slice(0, 8);
  }, [airports, query]);

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        width: 530,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 18px 36px rgba(15, 23, 42, 0.14)",
        border: "1px solid #e5e7eb",
        zIndex: 70,
        overflow: "hidden",
      }}
    >
      {loading ? (
        <div
          style={{
            padding: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          <LoaderCircle size={16} className="animate-spin" /> Loading airports…
        </div>
      ) : !normalizeText(query) && recentSearch ? (
        <div style={{ padding: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>
              Recent Searches
            </div>
            <button
              type="button"
              style={{
                border: "none",
                background: "transparent",
                color: "#0071c2",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                padding: 0,
              }}
            >
              clear
            </button>
          </div>

          <button
            type="button"
            onClick={onRecentSelect}
            style={{
              width: "100%",
              border: "none",
              background: "#fff",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: 16,
              boxShadow: "0 8px 22px rgba(15, 23, 42, 0.08)",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 62,
                height: 58,
                borderRadius: 12,
                background: "#eef2f7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                flexShrink: 0,
              }}
            >
              <Plane size={22} color="#111827" />
              <div
                style={{
                  position: "absolute",
                  right: 8,
                  bottom: 8,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#0071c2",
                  color: "#fff",
                  fontSize: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                1
              </div>
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
                {recentSearch.routeLabel}
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>
                {recentSearch.dateLabel}
              </div>
            </div>
          </button>
        </div>
      ) : filteredAirports.length ? (
        <div style={{ maxHeight: 360, overflowY: "auto" }}>
          {filteredAirports.map((airport) => (
            <button
              key={airport.code}
              type="button"
              onClick={() => onSelect(airport)}
              style={{
                width: "100%",
                border: "none",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                textAlign: "left",
                cursor: "pointer",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div
                style={{
                  minWidth: 48,
                  height: 34,
                  borderRadius: 8,
                  background: "#003580",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {airport.code}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}
                >
                  {airport.city}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
                  {airport.name}, {airport.country}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ padding: 18, color: "#6b7280", fontSize: 14 }}>
          No airports found
        </div>
      )}
    </div>
  );
}

function BookingCalendarPopover({
  monthDate,
  onPrevMonth,
  onNextMonth,
  departDate,
  returnDate,
  onDaySelect,
}) {
  const leftMonth = monthDate;
  const rightMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    1,
  );
  const depart = departDate ? new Date(`${departDate}T00:00:00`) : null;
  const returning = returnDate ? new Date(`${returnDate}T00:00:00`) : null;

  const renderMonth = (currentMonth, side) => {
    const weeks = getMonthMatrix(currentMonth);

    return (
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: side === "left" ? "space-between" : "flex-end",
            gap: 12,
            marginBottom: 18,
          }}
        >
          {side === "left" ? (
            <button
              type="button"
              onClick={onPrevMonth}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              <ChevronLeft size={24} color="#111827" />
            </button>
          ) : (
            <div style={{ width: 24 }} />
          )}

          <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>
            {getMonthTitle(currentMonth)}
          </div>

          {side === "right" ? (
            <button
              type="button"
              onClick={onNextMonth}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              <ChevronRight size={24} color="#111827" />
            </button>
          ) : (
            <div style={{ width: 24 }} />
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 8,
            marginBottom: 12,
            color: "#111827",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
            <div key={`${side}-${day}`} style={{ textAlign: "center" }}>
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {weeks.map((week, rowIndex) => (
            <div
              key={`${side}-week-${rowIndex}`}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 6,
              }}
            >
              {week.map((day, dayIndex) => {
                const selected =
                  isSameDay(day, depart) || isSameDay(day, returning);
                const inRange =
                  day && depart && returning
                    ? isDayWithinRange(
                        new Date(day),
                        new Date(depart),
                        new Date(returning),
                      )
                    : false;

                return day ? (
                  <button
                    key={`${side}-${rowIndex}-${dayIndex}`}
                    type="button"
                    onClick={() => onDaySelect(day)}
                    style={{
                      height: 48,
                      border: "none",
                      borderRadius: 0,
                      background: selected
                        ? "#1f2937"
                        : inRange
                          ? "#374151"
                          : "transparent",
                      color: selected || inRange ? "#fff" : "#111827",
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {day.getDate()}
                  </button>
                ) : (
                  <div key={`${side}-${rowIndex}-${dayIndex}`} />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        width: 820,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 18px 36px rgba(15, 23, 42, 0.14)",
        border: "1px solid #e5e7eb",
        zIndex: 70,
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "18px 20px 8px" }}>
        <div
          style={{
            display: "flex",
            gap: 28,
            marginBottom: 18,
            fontWeight: 800,
            color: "#6b7280",
          }}
        >
          <div
            style={{
              color: "#111827",
              borderBottom: "3px solid #111827",
              paddingBottom: 6,
            }}
          >
            DATES
          </div>
          <div>WEEKEND</div>
          <div>MONTH</div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 26,
              color: "#111827",
            }}
          >
            <div>
              Departure{" "}
              <span style={{ color: "#0071c2", fontWeight: 500 }}>exact</span>
            </div>
            <div>
              Return{" "}
              <span style={{ color: "#0071c2", fontWeight: 500 }}>exact</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 26, alignItems: "flex-start" }}>
          {renderMonth(leftMonth, "left")}
          {renderMonth(rightMonth, "right")}
        </div>
      </div>
    </div>
  );
}

function BookingTravelersPopover({
  adults,
  setAdults,
  children,
  setChildren,
  infants,
  setInfants,
  cabinClass,
  setCabinClass,
}) {
  const rows = [
    {
      label: "Adults",
      subLabel: "18+",
      value: adults,
      setter: setAdults,
      min: 1,
    },
    {
      label: "Children",
      subLabel: "0–17",
      value: children,
      setter: setChildren,
      min: 0,
    },
    {
      label: "Infants on lap",
      subLabel: "under 2",
      value: infants,
      setter: setInfants,
      min: 0,
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        width: 446,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 18px 36px rgba(15, 23, 42, 0.14)",
        border: "1px solid #e5e7eb",
        zIndex: 70,
        overflow: "hidden",
      }}
    >
      <div style={{ padding: 18 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#111827",
            marginBottom: 18,
          }}
        >
          Travelers
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {rows.map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 15, color: "#111827" }}>
                  {row.label}{" "}
                  <span style={{ color: "#64748b" }}>{row.subLabel}</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => row.setter(Math.max(row.min, row.value - 1))}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Minus size={14} color="#64748b" />
                </button>
                <div
                  style={{
                    width: 20,
                    textAlign: "center",
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  {row.value}
                </div>
                <button
                  type="button"
                  onClick={() => row.setter(row.value + 1)}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: "1px solid #94a3b8",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} color="#334155" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: "1px solid #e5e7eb", padding: 18 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#111827",
            marginBottom: 16,
          }}
        >
          Cabin Class
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["Economy", "Premium Economy", "Business", "First"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCabinClass(item)}
              style={{
                border: `1px solid ${cabinClass === item ? "#111827" : "#cbd5e1"}`,
                background: cabinClass === item ? "#f8fafc" : "#fff",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 14,
                color: "#111827",
                cursor: "pointer",
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchPanel({
  compact = false,
  from,
  to,
  setFrom,
  setTo,
  departDate,
  setDepartDate,
  returnDate,
  setReturnDate,
  tripType,
  setTripType,
  adults,
  setAdults,
  cabinClass,
  setCabinClass,
  onSwap,
  onSearch,
  airports,
  airportsLoading,
  routeSuggestions,
  childrenCount = 0,
  setChildrenCount = () => {},
  infantsCount = 0,
  setInfantsCount = () => {},
}) {
  const [activePopover, setActivePopover] = useState(null);
  const [locationDrafts, setLocationDrafts] = useState({ from: "", to: "" });
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(`${departDate}T00:00:00`),
  );
  const [dateTarget, setDateTarget] = useState("depart");
  const panelRef = useRef(null);

  useEffect(() => {
    if (!activePopover) return undefined;

    const handleClick = (event) => {
      if (!panelRef.current?.contains(event.target)) {
        setActivePopover(null);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [activePopover]);

  useEffect(() => {
    setCalendarMonth(new Date(`${departDate}T00:00:00`));
  }, [departDate]);

  const recentSearch =
    from && to
      ? {
          routeLabel: `${from} - ${to}`,
          dateLabel: `${departDate}${tripType === "round" ? ` - ${returnDate}` : ""}`,
        }
      : null;

  const openLocationPopover = (field) => {
    setActivePopover((current) => (current === field ? null : field));
    setLocationDrafts((current) => ({ ...current, [field]: "" }));
  };

  const openDatesPopover = () => {
    setActivePopover((current) => {
      if (current === "dates") return null;
      setDateTarget("depart");
      return "dates";
    });
  };

  const openTravelersPopover = () => {
    setActivePopover((current) =>
      current === "travelers" ? null : "travelers",
    );
  };

  const handleAirportSelect = (field, airport) => {
    const label = formatAirportLabel(airport);
    if (field === "from") setFrom(label);
    if (field === "to") setTo(label);
    setLocationDrafts((current) => ({ ...current, [field]: "" }));
    setActivePopover(null);
  };

  const handleRecentSelect = () => {
    setActivePopover(null);
  };

  const handleDateSelect = (day) => {
    const isoValue = toIsoDate(day);

    if (tripType === "oneway") {
      setDepartDate(isoValue);
      setActivePopover(null);
      return;
    }

    if (dateTarget === "depart") {
      setDepartDate(isoValue);
      if (
        !returnDate ||
        new Date(`${isoValue}T00:00:00`) > new Date(`${returnDate}T00:00:00`)
      ) {
        setReturnDate(isoValue);
      }
      setDateTarget("return");
      return;
    }

    setReturnDate(isoValue);
    setDateTarget("depart");
    setActivePopover(null);
  };

  if (!compact) {
    return (
      <div
        ref={panelRef}
        style={{
          position: "relative",
          width: "100%",
        }}
      >
        <button
          type="button"
          onClick={() => setTripType(tripType === "round" ? "oneway" : "round")}
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            marginBottom: 14,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 15,
            color: "#374151",
            cursor: "pointer",
          }}
        >
          {tripType === "round" ? "Round-trip" : "One-way"}
          <ChevronDown size={16} />
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1.45fr) minmax(245px, 0.62fr) minmax(198px, 0.5fr) 116px",
            gap: 0,
            border: "1px solid #d1d5db",
            borderRadius: 14,
            overflow: "visible",
            background: "#fff",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
            minHeight: 68,
            width: "100%",
          }}
        >
          <div
            style={{
              position: "relative",
              minWidth: 0,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            <button
              type="button"
              onClick={() => openLocationPopover("from")}
              style={{
                border: "none",
                borderRight: "1px solid #e5e7eb",
                background: "#fff",
                minHeight: 68,
                padding: "0 18px",
                textAlign: "left",
                cursor: "text",
                boxShadow:
                  activePopover === "from" ? "inset 0 0 0 2px #111827" : "none",
              }}
            >
              {activePopover === "from" ? (
                <input
                  autoFocus
                  value={locationDrafts.from}
                  onChange={(event) =>
                    setLocationDrafts((current) => ({
                      ...current,
                      from: event.target.value,
                    }))
                  }
                  placeholder="From?"
                  style={{
                    width: "100%",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: 18,
                    color: "#64748b",
                  }}
                />
              ) : from ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    maxWidth: "100%",
                    border: "1px solid #d1d5db",
                    borderRadius: 10,
                    padding: "8px 12px",
                    background: "#eef2f7",
                    color: "#111827",
                    fontSize: 14,
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {from}
                  </span>
                  <span
                    style={{ color: "#4b5563", fontSize: 18, lineHeight: 1 }}
                  >
                    ×
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: 18, color: "#64748b" }}>From?</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => openLocationPopover("to")}
              style={{
                border: "none",
                background: "#fff",
                minHeight: 68,
                padding: "0 18px 0 30px",
                textAlign: "left",
                cursor: "text",
                boxShadow:
                  activePopover === "to" ? "inset 0 0 0 2px #111827" : "none",
              }}
            >
              {activePopover === "to" ? (
                <input
                  autoFocus
                  value={locationDrafts.to}
                  onChange={(event) =>
                    setLocationDrafts((current) => ({
                      ...current,
                      to: event.target.value,
                    }))
                  }
                  placeholder="To?"
                  style={{
                    width: "100%",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: 18,
                    color: "#64748b",
                  }}
                />
              ) : to ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    maxWidth: "100%",
                    border: "1px solid #d1d5db",
                    borderRadius: 10,
                    padding: "8px 12px",
                    background: "#eef2f7",
                    color: "#111827",
                    fontSize: 14,
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {to}
                  </span>
                  <span
                    style={{ color: "#4b5563", fontSize: 18, lineHeight: 1 }}
                  >
                    ×
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: 18, color: "#64748b" }}>To?</span>
              )}
            </button>

            <button
              type="button"
              onClick={onSwap}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid #d1d5db",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 2,
                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
              }}
            >
              <ArrowLeftRight size={16} color="#374151" />
            </button>

            {(activePopover === "from" || activePopover === "to") && (
              <BookingLocationPopover
                airports={airports}
                loading={airportsLoading}
                query={
                  activePopover === "from"
                    ? locationDrafts.from
                    : locationDrafts.to
                }
                onSelect={(airport) =>
                  handleAirportSelect(activePopover, airport)
                }
                recentSearch={recentSearch}
                onRecentSelect={handleRecentSelect}
              />
            )}
          </div>

          <div style={{ position: "relative", minWidth: 0 }}>
            <button
              type="button"
              onClick={openDatesPopover}
              style={{
                border: "none",
                borderLeft: "1px solid #e5e7eb",
                background: "#fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                minHeight: 68,
                cursor: "pointer",
                gap: 18,
                fontSize: 18,
                color: "#1f2937",
                boxShadow:
                  activePopover === "dates"
                    ? "inset 0 0 0 2px #111827"
                    : "none",
              }}
            >
              <span>{formatBookingShortDate(departDate)}</span>
              <span style={{ color: "#4b5563" }}>–</span>
              <span>
                {tripType === "round"
                  ? formatBookingShortDate(returnDate)
                  : "One-way"}
              </span>
            </button>

            {activePopover === "dates" && (
              <BookingCalendarPopover
                monthDate={calendarMonth}
                onPrevMonth={() =>
                  setCalendarMonth(
                    (current) =>
                      new Date(
                        current.getFullYear(),
                        current.getMonth() - 1,
                        1,
                      ),
                  )
                }
                onNextMonth={() =>
                  setCalendarMonth(
                    (current) =>
                      new Date(
                        current.getFullYear(),
                        current.getMonth() + 1,
                        1,
                      ),
                  )
                }
                departDate={departDate}
                returnDate={tripType === "round" ? returnDate : departDate}
                onDaySelect={handleDateSelect}
              />
            )}
          </div>

          <div style={{ position: "relative", minWidth: 0 }}>
            <button
              type="button"
              onClick={openTravelersPopover}
              style={{
                border: "none",
                borderLeft: "1px solid #e5e7eb",
                background: "#fff",
                width: "100%",
                minHeight: 68,
                padding: "0 18px",
                fontSize: 18,
                color: "#1f2937",
                textAlign: "left",
                cursor: "pointer",
                boxShadow:
                  activePopover === "travelers"
                    ? "inset 0 0 0 2px #111827"
                    : "none",
              }}
            >
              {getTravelerPanelSummary(
                adults,
                childrenCount,
                infantsCount,
                cabinClass,
              )}
            </button>

            {activePopover === "travelers" && (
              <BookingTravelersPopover
                adults={adults}
                setAdults={setAdults}
                children={childrenCount}
                setChildren={setChildrenCount}
                infants={infantsCount}
                setInfants={setInfantsCount}
                cabinClass={cabinClass}
                setCabinClass={setCabinClass}
              />
            )}
          </div>

          <button
            onClick={onSearch}
            style={{
              border: "none",
              background: "#0071c2",
              color: "#fff",
              fontSize: 15,
              fontWeight: 800,
              borderRadius: 12,
              margin: 7,
              minHeight: 54,
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: compact ? "transparent" : "#febb02",
        borderRadius: compact ? 0 : 18,
        padding: compact ? 0 : 8,
        boxShadow: compact ? "none" : "0 22px 46px rgba(15, 23, 42, 0.18)",
      }}
    >
      <div
        style={{
          background: compact ? "transparent" : "#febb02",
          borderRadius: compact ? 0 : 14,
          padding: compact ? 0 : 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: compact ? 10 : 12,
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { key: "round", label: "Туда и обратно" },
              { key: "oneway", label: "В одну сторону" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setTripType(item.key)}
                style={{
                  border:
                    item.key === tripType
                      ? "1px solid #003b95"
                      : "1px solid #d1d5db",
                  background: item.key === tripType ? "#e7f0ff" : "#fff",
                  color: "#111827",
                  borderRadius: 999,
                  padding: compact ? "7px 12px" : "9px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#fff",
                border: "1px solid #d1d5db",
                borderRadius: 999,
                padding: compact ? "7px 12px" : "9px 14px",
              }}
            >
              <Users size={14} color="#4b5563" />
              <input
                type="number"
                min={1}
                max={9}
                value={adults}
                onChange={(event) =>
                  setAdults(Math.max(1, Number(event.target.value) || 1))
                }
                style={{
                  width: 34,
                  border: "none",
                  outline: "none",
                  fontWeight: 700,
                  background: "transparent",
                }}
              />
              <span style={{ fontSize: 13, color: "#4b5563" }}>пасс.</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#fff",
                border: "1px solid #d1d5db",
                borderRadius: 999,
                padding: compact ? "7px 12px" : "9px 14px",
              }}
            >
              <select
                value={cabinClass}
                onChange={(event) => setCabinClass(event.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                <option>Economy</option>
                <option>Premium Economy</option>
                <option>Business</option>
                <option>First</option>
              </select>
              <ChevronDown size={14} color="#6b7280" />
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "stretch",
            flexWrap: "wrap",
          }}
        >
          <AirportSuggest
            label="Откуда"
            value={from}
            onChange={setFrom}
            airports={airports}
            placeholder="Ташкент (TAS)"
            loading={airportsLoading}
            compact={compact}
          />

          <button
            onClick={onSwap}
            style={{
              width: compact ? 44 : 48,
              height: compact ? 64 : 76,
              borderRadius: 12,
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
            label="Куда"
            value={to}
            onChange={setTo}
            airports={airports}
            placeholder="Дубай (DXB)"
            loading={airportsLoading}
            compact={compact}
          />

          <DateField
            label="Туда"
            value={departDate}
            onChange={setDepartDate}
            compact={compact}
          />

          <DateField
            label="Обратно"
            value={returnDate}
            onChange={setReturnDate}
            compact={compact}
            disabled={tripType === "oneway"}
          />

          <button
            onClick={onSearch}
            style={{
              minWidth: compact ? 150 : 170,
              minHeight: compact ? 64 : 76,
              borderRadius: compact ? 12 : 14,
              border: "none",
              background: "#0071c2",
              color: "#fff",
              fontSize: compact ? 15 : 16,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer",
              padding: "0 20px",
              boxShadow: "0 10px 20px rgba(0, 113, 194, 0.22)",
            }}
          >
            <Search size={17} /> Найти
          </button>
        </div>
      </div>
    </div>
  );
}

function SidebarSection({ title, children, action }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #dbe3ec",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 8px 18px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>
          {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function FlightSegment({ label, leg }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
      <AirlineLogo airline={leg.airline} />

      <div style={{ flex: 1, minWidth: 260 }}>
        <div
          style={{
            fontSize: 12,
            color: "#6b7280",
            marginBottom: 8,
            fontWeight: 700,
          }}
        >
          {label}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(56px, auto) minmax(0, 1fr) minmax(56px, auto)",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "#111827",
                lineHeight: 1,
              }}
            >
              {leg.dep}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 5 }}>
              {leg.route?.split("-")?.[0] || "—"}
            </div>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <div style={{ height: 1, background: "#cbd5e1", flex: 1 }} />
              <Plane size={14} color="#6b7280" />
              <div style={{ height: 1, background: "#cbd5e1", flex: 1 }} />
            </div>
            <div
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "#4b5563",
                fontWeight: 700,
              }}
            >
              {leg.duration}
            </div>
            <div
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "#b45309",
                marginTop: 2,
              }}
            >
              {leg.stops}
              {leg.stopCity ? ` · ${leg.stopCity}` : ""}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "#111827",
                lineHeight: 1,
              }}
            >
              {leg.arr}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 5 }}>
              {leg.route?.split("-")?.[1] || "—"}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 13, color: "#4b5563", marginTop: 10 }}>
          {leg.airline}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ flight, selected, onSelect }) {
  return (
    <article
      style={{
        background: "#fff",
        border: selected ? "2px solid #0071c2" : "1px solid #dbe3ec",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: selected
          ? "0 16px 32px rgba(0, 113, 194, 0.14)"
          : "0 10px 22px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(220px, 0.3fr)",
          gap: 0,
        }}
      >
        <div style={{ padding: 18, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "#111827",
                  fontWeight: 800,
                }}
              >
                <AirlineLogo airline={flight.out.airline} size={30} />
                {flight.out.airline}
              </div>
              {flight.out.airline !== flight.back.airline && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: "#111827",
                    fontWeight: 800,
                  }}
                >
                  <AirlineLogo airline={flight.back.airline} size={30} />
                  {flight.back.airline}
                </div>
              )}
            </div>

            <button
              type="button"
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: "1px solid #d1d5db",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Share2 size={15} color="#6b7280" />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <FlightSegment label="Туда" leg={flight.out} />
            <div style={{ height: 1, background: "#eef2f7" }} />
            <FlightSegment label="Обратно" leg={flight.back} />
          </div>
        </div>

        <aside
          style={{
            borderLeft: "1px solid #eef2f7",
            padding: 18,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 16,
            background: selected ? "#f8fbff" : "#fff",
          }}
        >
          <div>
            {flight.tags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginBottom: 12,
                  flexWrap: "wrap",
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
                      fontWeight: 800,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
              Цена за 1 пассажира
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#111827",
                lineHeight: 1.1,
              }}
            >
              {formatCurrency(flight.price)}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
              {flight.cabin}
            </div>
          </div>

          <button
            onClick={onSelect}
            style={{
              width: "100%",
              border: "none",
              borderRadius: 12,
              background: selected ? "#111827" : "#0071c2",
              color: "#fff",
              padding: "12px 0",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: selected
                ? "0 10px 18px rgba(17, 24, 39, 0.16)"
                : "0 10px 20px rgba(0, 113, 194, 0.18)",
            }}
          >
            {selected ? "Выбрано" : "Смотреть предложение"}
          </button>
        </aside>
      </div>
    </article>
  );
}

export default function FlightsBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultDepartDate = useMemo(
    () => toIsoDate(addDays(new Date(), 16)),
    [],
  );
  const defaultReturnDate = useMemo(
    () => toIsoDate(addDays(new Date(), 24)),
    [],
  );

  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");
  const [tripType, setTripType] = useState(searchParams.get("trip") || "round");
  const [adults, setAdults] = useState(Number(searchParams.get("adults") || 1));
  const [childrenCount, setChildrenCount] = useState(
    Math.max(0, Number(searchParams.get("children") || 0)),
  );
  const [infantsCount, setInfantsCount] = useState(
    Math.max(0, Number(searchParams.get("infants") || 0)),
  );
  const [cabinClass, setCabinClass] = useState(
    searchParams.get("cabin") || "Economy",
  );
  const [departDate, setDepartDate] = useState(
    searchParams.get("depart") || defaultDepartDate,
  );
  const [returnDate, setReturnDate] = useState(
    searchParams.get("return") || defaultReturnDate,
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "best");
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedFlightId, setSelectedFlightId] = useState(null);
  const [stopsFilter, setStopsFilter] = useState({
    nonstop: true,
    one: true,
    two: true,
  });
  const [selectedAirlines, setSelectedAirlines] = useState({});

  const isResultsView = searchParams.get("search") === "1";

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
  const { data: flights = [], isLoading: flightsLoading } = useFlights();

  useEffect(() => {
    setFrom(searchParams.get("from") || "");
    setTo(searchParams.get("to") || "");
    setTripType(searchParams.get("trip") || "round");
    setAdults(Math.max(1, Number(searchParams.get("adults") || 1)));
    setChildrenCount(Math.max(0, Number(searchParams.get("children") || 0)));
    setInfantsCount(Math.max(0, Number(searchParams.get("infants") || 0)));
    setCabinClass(searchParams.get("cabin") || "Economy");
    setDepartDate(searchParams.get("depart") || defaultDepartDate);
    setReturnDate(searchParams.get("return") || defaultReturnDate);
    setSortBy(searchParams.get("sort") || "best");
  }, [defaultDepartDate, defaultReturnDate, searchParams]);

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
        if (sortBy === "quickest") {
          return totalDurationMinutes(left) - totalDurationMinutes(right);
        }
        const leftBest = left.tags.includes("Best") ? -1 : 0;
        const rightBest = right.tags.includes("Best") ? -1 : 0;
        if (leftBest !== rightBest) return leftBest - rightBest;
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
  const selectedFlight =
    filteredFlights.find((flight) => flight.id === selectedFlightId) || null;

  const activeRouteSummary = `${fromAirport?.city || "Откуда"} → ${toAirport?.city || "Куда"}`;
  const activeDateSummary = formatDateRangeLabel(
    departDate,
    returnDate,
    tripType,
  );

  const handleSwap = () => {
    const previousFrom = from;
    setFrom(to);
    setTo(previousFrom);
  };

  const handleSearch = (overrides = {}) => {
    const nextFrom =
      overrides.from ||
      from ||
      formatAirportLabel(
        airports.find((airport) => airport.code === "TAS") || airports[0],
      );
    const nextTo =
      overrides.to ||
      to ||
      (routeSuggestions[0]
        ? `${routeSuggestions[0].toCity} (${routeSuggestions[0].toCode})`
        : "");

    setFrom(nextFrom);
    setTo(nextTo);
    setVisibleCount(6);
    setSelectedFlightId(null);

    const nextParams = {
      search: "1",
      from: nextFrom,
      to: nextTo,
      trip: tripType,
      adults: String(adults),
      children: String(childrenCount),
      infants: String(infantsCount),
      cabin: cabinClass,
      depart: departDate,
      sort: sortBy,
    };

    if (tripType === "round") {
      nextParams.return = returnDate;
    }

    router.push("/flights?" + new URLSearchParams(nextParams).toString());
  };

  const handleResetSearch = () => {
    router.push("/flights");
    setSelectedFlightId(null);
  };

  const clearFilters = () => {
    setStopsFilter({ nonstop: true, one: true, two: true });
    setSelectedAirlines(
      Object.fromEntries(airlineOptions.map((airline) => [airline, true])),
    );
    setSortBy("best");
  };

  if (!isResultsView) {
    return (
      <div style={{ minHeight: "100vh", background: "#ffffff" }}>
        <Header />

        <section
          style={{
            background: "#ffffff",
            padding: "14px 0 0",
          }}
        >
          <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 20px" }}>
            <div
              style={{
                background: "#eef2f5",
                borderRadius: 0,
                padding: "34px 40px 42px",
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.78fr) minmax(240px, 0.46fr)",
                gap: 24,
                alignItems: "start",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "clamp(38px, 5vw, 58px)",
                    lineHeight: 1.08,
                    fontWeight: 900,
                    margin: 0,
                    maxWidth: 760,
                    color: "#1f2937",
                  }}
                >
                  Search hundreds of flight sites at once.
                </h1>

                <div style={{ marginTop: 28, maxWidth: 1240 }}>
                  <SearchPanel
                    from={from}
                    to={to}
                    setFrom={setFrom}
                    setTo={setTo}
                    departDate={departDate}
                    setDepartDate={setDepartDate}
                    returnDate={returnDate}
                    setReturnDate={setReturnDate}
                    tripType={tripType}
                    setTripType={setTripType}
                    adults={adults}
                    setAdults={setAdults}
                    childrenCount={childrenCount}
                    setChildrenCount={setChildrenCount}
                    infantsCount={infantsCount}
                    setInfantsCount={setInfantsCount}
                    cabinClass={cabinClass}
                    setCabinClass={setCabinClass}
                    onSwap={handleSwap}
                    onSearch={handleSearch}
                    airports={airports}
                    airportsLoading={airportsLoading}
                    routeSuggestions={routeSuggestions}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gridTemplateRows: "122px 122px",
                  gap: 12,
                  background: "#e5e7eb",
                  padding: 0,
                  borderRadius: 16,
                  overflow: "hidden",
                  maxWidth: 280,
                  justifySelf: "end",
                }}
              >
                {HERO_IMAGES.map((src, index) => (
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
                          ? "0 0 34px 0"
                          : index === 1
                            ? "0 0 0 34px"
                            : index === 2
                              ? "34px 0 0 0"
                              : "0 34px 0 0",
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ height: 270 }} />
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <Header />

      <section style={{ background: "#003b95", padding: "20px 0 18px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ color: "#fff", marginBottom: 14 }}>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>
              {activeRouteSummary}
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.88)" }}>
              {activeDateSummary} · {adults} пассажир{adults > 1 ? "а" : ""} ·{" "}
              {cabinClass}
            </div>
          </div>

          <SearchPanel
            compact
            from={from}
            to={to}
            setFrom={setFrom}
            setTo={setTo}
            departDate={departDate}
            setDepartDate={setDepartDate}
            returnDate={returnDate}
            setReturnDate={setReturnDate}
            tripType={tripType}
            setTripType={setTripType}
            adults={adults}
            setAdults={setAdults}
            childrenCount={childrenCount}
            setChildrenCount={setChildrenCount}
            infantsCount={infantsCount}
            setInfantsCount={setInfantsCount}
            cabinClass={cabinClass}
            setCabinClass={setCabinClass}
            onSwap={handleSwap}
            onSearch={handleSearch}
            airports={airports}
            airportsLoading={airportsLoading}
            routeSuggestions={routeSuggestions}
          />
        </div>
      </section>

      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 16px 46px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#4b5563",
              fontSize: 13,
            }}
          >
            <Info size={16} color="#0071c2" />
            Результаты загружаются из Supabase, а если дополнительных таблиц
            маршрутов нет — строятся прямо из таблицы `flights`.
          </div>

          <button
            onClick={handleResetSearch}
            style={{
              border: "1px solid #cbd5e1",
              background: "#fff",
              borderRadius: 999,
              padding: "9px 14px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Вернуться к стартовому экрану
          </button>
        </div>

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
              top: 88,
            }}
          >
            <SidebarSection
              title="Фильтры"
              action={
                <button
                  onClick={clearFilters}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#0071c2",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Сбросить
                </button>
              }
            >
              <div style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.6 }}>
                Настройте пересадки, авиакомпании и сортировку, чтобы повторить
                выдачу в стиле Booking.
              </div>
            </SidebarSection>

            <SidebarSection title="Пересадки">
              {[
                { key: "nonstop", label: "Без пересадок" },
                { key: "one", label: "1 пересадка" },
                { key: "two", label: "2+ пересадки" },
              ].map((item) => {
                const stats = stopStats[item.key];
                const priceLabel = Number.isFinite(stats.minPrice)
                  ? formatCurrency(stats.minPrice)
                  : null;

                return (
                  <label
                    key={item.key}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "18px minmax(0, 1fr) auto",
                      alignItems: "start",
                      gap: 10,
                      marginBottom: 12,
                      cursor: "pointer",
                      fontSize: 13,
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
                      style={{ marginTop: 2 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: "#111827" }}>
                        {item.label}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}
                      >
                        {stats.count} вариантов
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {priceLabel || "—"}
                    </div>
                  </label>
                );
              })}
            </SidebarSection>

            <SidebarSection title="Авиакомпании">
              {airlineOptions.map((airline) => (
                <label
                  key={airline}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 13,
                    marginBottom: 12,
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
                  <AirlineLogo airline={airline} size={30} />
                  <span style={{ color: "#111827", fontWeight: 700 }}>
                    {airline}
                  </span>
                </label>
              ))}
            </SidebarSection>
          </div>

          <div>
            <div
              style={{
                background: "#fff",
                border: "1px solid #dbe3ec",
                borderRadius: 18,
                overflow: "hidden",
                display: "flex",
                flexWrap: "wrap",
                marginBottom: 14,
                boxShadow: "0 10px 22px rgba(15, 23, 42, 0.05)",
              }}
            >
              {[
                {
                  key: "best",
                  label: "Best",
                  description: "Лучший баланс цены и удобства",
                  value: cheapestPrice ? formatCurrency(cheapestPrice) : "—",
                },
                {
                  key: "cheapest",
                  label: "Cheapest",
                  description: "Минимальная цена по выдаче",
                  value: cheapestPrice ? formatCurrency(cheapestPrice) : "—",
                },
                {
                  key: "quickest",
                  label: "Quickest",
                  description: "Самое быстрое путешествие",
                  value: quickestFlight ? quickestFlight.out.duration : "—",
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSortBy(tab.key)}
                  style={{
                    flex: 1,
                    minWidth: 220,
                    border: "none",
                    borderBottom:
                      sortBy === tab.key
                        ? "3px solid #0071c2"
                        : "3px solid transparent",
                    background: sortBy === tab.key ? "#f8fbff" : "#fff",
                    textAlign: "left",
                    padding: "16px 18px",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: sortBy === tab.key ? "#0071c2" : "#111827",
                    }}
                  >
                    {tab.label}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                    {tab.description}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#111827",
                      marginTop: 8,
                    }}
                  >
                    {tab.value}
                  </div>
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 12, fontSize: 13, color: "#4b5563" }}>
              {activeRouteSummary} · {filteredFlights.length} вариантов ·{" "}
              {activeDateSummary}
            </div>

            {flightsLoading ? (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #dbe3ec",
                  borderRadius: 18,
                  padding: 24,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "#6b7280",
                }}
              >
                <LoaderCircle size={18} className="animate-spin" /> Загружаем
                рейсы…
              </div>
            ) : filteredFlights.length === 0 ? (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #dbe3ec",
                  borderRadius: 18,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: "#111827",
                    marginBottom: 8,
                  }}
                >
                  По этому направлению пока нет результатов
                </div>
                <div
                  style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}
                >
                  Попробуйте выбрать одно из популярных направлений выше или
                  добавьте недостающие маршруты через SQL-файл обновления
                  Supabase.
                </div>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {filteredFlights.slice(0, visibleCount).map((flight) => (
                  <ResultCard
                    key={flight.id}
                    flight={flight}
                    selected={selectedFlightId === flight.id}
                    onSelect={() => setSelectedFlightId(flight.id)}
                  />
                ))}

                {visibleCount < filteredFlights.length ? (
                  <button
                    onClick={() => setVisibleCount((current) => current + 6)}
                    style={{
                      marginTop: 2,
                      border: "none",
                      borderRadius: 14,
                      background: "#111827",
                      color: "#fff",
                      padding: "14px 18px",
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Показать ещё результаты
                  </button>
                ) : (
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color: "#6b7280",
                      lineHeight: 1.6,
                    }}
                  >
                    Цены показаны за одного пассажира и могут меняться в
                    зависимости от багажа, правил тарифа и сайта-партнёра.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {selectedFlight && (
          <div
            style={{
              position: "sticky",
              bottom: 16,
              marginTop: 16,
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(16px)",
              border: "1px solid #dbe3ec",
              borderRadius: 18,
              padding: 18,
              boxShadow: "0 18px 36px rgba(15, 23, 42, 0.14)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#0071c2",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  Предложение выбрано
                </div>
                <div
                  style={{ fontSize: 20, fontWeight: 900, color: "#111827" }}
                >
                  {selectedFlight.out.airline} · {activeRouteSummary}
                </div>
                <div style={{ fontSize: 13, color: "#4b5563", marginTop: 4 }}>
                  {activeDateSummary} · {selectedFlight.out.duration} туда ·{" "}
                  {selectedFlight.back.duration} обратно
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}
                >
                  Итого
                </div>
                <div
                  style={{ fontSize: 28, fontWeight: 900, color: "#111827" }}
                >
                  {formatCurrency(selectedFlight.price)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
