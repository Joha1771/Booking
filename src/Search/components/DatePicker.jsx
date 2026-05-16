import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isAfter,
  isBefore,
  isToday,
} from "date-fns";
import { ru } from "date-fns/locale";
import useSearchStore from "../store/useSearchStore.js";

function MonthGrid({ month, checkIn, checkOut, selecting, onDayClick }) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });

  const days = [];
  let d = start;
  while (!isAfter(d, end)) {
    days.push(d);
    d = addDays(d, 1);
  }

  const DAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: 16,
          marginBottom: 12,
        }}
      >
        {format(month, "LLLL yyyy", { locale: ru })}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 2,
        }}
      >
        {DAYS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "#888",
              padding: "4px 0",
              fontWeight: 600,
            }}
          >
            {d}
          </div>
        ))}
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, month);
          const isStart = checkIn && isSameDay(day, checkIn);
          const isEnd = checkOut && isSameDay(day, checkOut);
          const inRange =
            checkIn &&
            checkOut &&
            isAfter(day, checkIn) &&
            isBefore(day, checkOut);
          const isPast = isBefore(day, new Date()) && !isToday(day);
          const todayDay = isToday(day);

          return (
            <div
              key={i}
              onClick={() => !isPast && inMonth && onDayClick(day)}
              style={{
                textAlign: "center",
                padding: "6px 2px",
                fontSize: 14,
                cursor: inMonth && !isPast ? "pointer" : "default",
                color: !inMonth
                  ? "#ccc"
                  : isPast
                    ? "#ccc"
                    : isStart || isEnd
                      ? "#fff"
                      : "#333",
                background:
                  isStart || isEnd
                    ? "var(--booking-blue)"
                    : inRange
                      ? "#ebf3ff"
                      : "transparent",
                borderRadius: isStart
                  ? "50% 0 0 50%"
                  : isEnd
                    ? "0 50% 50% 0"
                    : "none",
                position: "relative",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background:
                    isStart || isEnd ? "var(--booking-blue)" : "transparent",
                  border:
                    todayDay && !isStart && !isEnd
                      ? "1px solid var(--booking-blue)"
                      : "none",
                  fontWeight: isStart || isEnd ? 700 : 400,
                }}
              >
                {format(day, "d")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DatePicker({ onClose }) {
  const { checkIn, checkOut, setCheckIn, setCheckOut, closeDatePicker } =
    useSearchStore();
  const [viewMonth, setViewMonth] = useState(new Date());
  const [selecting, setSelecting] = useState("start"); // 'start' | 'end'
  const [activeTab, setActiveTab] = useState("exact");

  const nextMonth = addMonths(viewMonth, 1);

  const handleDayClick = (day) => {
    if (selecting === "start" || (checkIn && checkOut)) {
      setCheckIn(day);
      setCheckOut(null);
      setSelecting("end");
    } else {
      if (isBefore(day, checkIn)) {
        setCheckIn(day);
        setCheckOut(null);
        setSelecting("end");
      } else {
        setCheckOut(day);
        setSelecting("start");
      }
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 4px)",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#fff",
        borderRadius: 4,
        boxShadow: "0 2px 16px rgba(0,0,0,0.25)",
        zIndex: 1000,
        width: 680,
        padding: 16,
      }}
    >
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--booking-border)",
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => setActiveTab("exact")}
          style={{
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 600,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: activeTab === "exact" ? "var(--booking-blue-light)" : "#666",
            borderBottom:
              activeTab === "exact"
                ? "2px solid var(--booking-blue-light)"
                : "2px solid transparent",
          }}
        >
          Календарь
        </button>
        <button
          onClick={() => setActiveTab("flexible")}
          style={{
            padding: "10px 20px",
            fontSize: 14,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color:
              activeTab === "flexible" ? "var(--booking-blue-light)" : "#666",
            borderBottom:
              activeTab === "flexible"
                ? "2px solid var(--booking-blue-light)"
                : "2px solid transparent",
          }}
        >
          У меня гибкие планы
        </button>
      </div>

      {/* Calendar navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 8,
        }}
      >
        <button
          onClick={() => setViewMonth(subMonths(viewMonth, 1))}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 4,
          }}
        >
          <ChevronLeft size={20} />
        </button>

        <div style={{ display: "flex", flex: 1, gap: 32 }}>
          <MonthGrid
            month={viewMonth}
            checkIn={checkIn}
            checkOut={checkOut}
            selecting={selecting}
            onDayClick={handleDayClick}
          />
          <MonthGrid
            month={nextMonth}
            checkIn={checkIn}
            checkOut={checkOut}
            selecting={selecting}
            onDayClick={handleDayClick}
          />
        </div>

        <button
          onClick={() => setViewMonth(addMonths(viewMonth, 1))}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 4,
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Quick selectors */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 12,
          flexWrap: "wrap",
        }}
      >
        {["Точные даты", "± 1 день", "± 2 дня", "± 3 дня", "± 7 дней"].map(
          (label, i) => (
            <button
              key={i}
              style={{
                padding: "6px 14px",
                border: "1px solid var(--booking-border)",
                borderRadius: 24,
                fontSize: 13,
                cursor: "pointer",
                background: i === 0 ? "#fff" : "#fff",
                color: "var(--booking-text)",
                fontWeight: i === 0 ? 600 : 400,
                borderColor:
                  i === 0 ? "var(--booking-blue)" : "var(--booking-border)",
              }}
            >
              {label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
