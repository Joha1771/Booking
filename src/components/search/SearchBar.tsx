"use client";
import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BedDouble, CalendarDays, Users } from "lucide-react";
import useSearchStore from "@/store/searchStore";
import DestinationDropdown from "./DestinationDropdown";
import DatePicker from "./DatePicker";
import GuestPicker from "./GuestPicker";

export default function SearchBar() {
  const router = useRouter();
  const {
    destination, setDestination,
    showDestDropdown, showDatePicker, showGuestPicker,
    openDestDropdown, closeDestDropdown,
    openDatePicker, closeDatePicker,
    openGuestPicker, closeGuestPicker,
    closeAll, travelingForWork, setTravelingForWork,
    getDateLabel, getGuestLabel,
  } = useSearchStore();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) closeAll();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [closeAll]);

  const handleDestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestination(e.target.value);
    if (!showDestDropdown) openDestDropdown();
  };

  const handleDestSelect = (city: string) => {
    setDestination(city);
    closeDestDropdown();
    openDatePicker();
  };

  const handleSearch = () => {
    closeAll();
    router.push(`/search?destination=${encodeURIComponent(destination)}`);
  };

  return (
    <div className="searchbar-shell" ref={containerRef}>
      <div className="searchbar-row">
        {/* Destination */}
        <div className="searchbar-field searchbar-field--grow">
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 2, padding: "0 12px", height: 52, border: showDestDropdown ? "2px solid var(--booking-yellow-dark)" : "2px solid transparent" }}>
            <BedDouble size={20} color="#555" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Куда вы хотите поехать?"
              value={destination}
              onChange={handleDestChange}
              onClick={openDestDropdown}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              style={{ border: "none", outline: "none", fontSize: 15, width: "100%", color: "var(--booking-text)", background: "transparent" }}
            />
            {destination && (
              <button onClick={e => { e.stopPropagation(); setDestination(""); openDestDropdown(); }}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "0 4px", color: "#555", fontSize: 18, lineHeight: 1 }}>
                ✕
              </button>
            )}
          </div>
          {showDestDropdown && <DestinationDropdown onSelect={handleDestSelect} />}
        </div>

        {/* Date picker */}
        <div className="searchbar-field searchbar-field--date">
          <div onClick={() => showDatePicker ? closeDatePicker() : openDatePicker()}
            style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 2, padding: "0 12px", height: 52, cursor: "pointer", border: showDatePicker ? "2px solid var(--booking-yellow-dark)" : "2px solid transparent", whiteSpace: "nowrap" }}>
            <CalendarDays size={20} color="#555" style={{ flexShrink: 0 }} />
            <span className="searchbar-label" style={{ fontSize: 15, color: "var(--booking-text)" }}>{getDateLabel()}</span>
          </div>
          {showDatePicker && <DatePicker />}
        </div>

        {/* Guest picker */}
        <div className="searchbar-field searchbar-field--guest">
          <div onClick={() => showGuestPicker ? closeGuestPicker() : openGuestPicker()}
            style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 2, padding: "0 12px", height: 52, cursor: "pointer", border: showGuestPicker ? "2px solid var(--booking-yellow-dark)" : "2px solid transparent", whiteSpace: "nowrap" }}>
            <Users size={20} color="#555" style={{ flexShrink: 0 }} />
            <span className="searchbar-label" style={{ fontSize: 15, color: "var(--booking-text)", flex: 1 }}>{getGuestLabel()}</span>
            <span style={{ fontSize: 18, color: "#555" }}>›</span>
          </div>
          {showGuestPicker && <GuestPicker />}
        </div>

        {/* Search button */}
        <button onClick={handleSearch} className="searchbar-button"
          style={{ background: "var(--booking-blue-light)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#0057b8")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--booking-blue-light)")}
        >
          Найти
        </button>
      </div>

      {/* Checkboxes */}
      <div className="searchbar-checks">
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" id="entire-place" style={{ width: 16, height: 16, cursor: "pointer" }} />
          <label htmlFor="entire-place" style={{ fontSize: 14, cursor: "pointer", color: "var(--booking-text)" }}>
            Я ищу дом или апартаменты целиком
          </label>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" id="work-travel" checked={travelingForWork}
            onChange={e => setTravelingForWork(e.target.checked)}
            style={{ width: 16, height: 16, cursor: "pointer" }} />
          <label htmlFor="work-travel" style={{ fontSize: 14, cursor: "pointer", color: "var(--booking-text)" }}>
            Я путешествую по работе
          </label>
        </div>
      </div>
    </div>
  );
}
