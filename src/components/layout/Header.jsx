import { Link, useNavigate, useLocation } from "react-router-dom";
import BedIcon from "../../assets/icons/bed.svg?react";

import HelpIcon from "../../assets/icons/help.svg?react";
import FlightIcon from "../../assets/icons/flight.svg?react";
import CarIcon from "../../assets/icons/car.svg?react";

const NAV_ITEMS = [
{ icon: BedIcon, label: "Жильё", href: "/"},
{ icon: FlightIcon, label: "Авиабилеты", href: "/flights" },
{ icon: CarIcon, label: "Аренда автомобилей", href: "/car-rental" },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header style={{ background: "var(--booking-blue)" }}>
      {/* Top bar */}
      <div className="site-container">
        <div className="header-top">
          {/* Logo */}
          <Link
            to="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontSize: 26,
                fontWeight: 900,
                fontFamily: "Georgia, serif",
                letterSpacing: "-0.5px",
              }}
            >
              Booking.com
            </span>
          </Link>

          {/* Right side */}
          <div className="header-right">
            {/* Currency */}
            <button
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 10px",
                borderRadius: 4,
              }}
            >
              UZS
              <img
                src="https://flagcdn.com/16x12/uz.png"
                alt="UZ"
                style={{ width: 20, height: 14, borderRadius: 2 }}
              />
            </button>

            {/* Help */}
            <button
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                padding: 6,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
              }}
            >
              <HelpIcon width={20} height={20} fill="white" />
            </button>

            {/* Register property */}
            <button
              style={{
                background: "transparent",
                border: "1.5px solid #fff",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: 4,
                whiteSpace: "nowrap",
              }}
            >
              Зарегистрировать свой объект
            </button>

            {/* User */}
            <div
              className="header-profile"
              onClick={() => navigate("/profile")}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#f5a623",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#fff",
                }}
              >
                J
              </div>
              <div className="header-profile-text">
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
                  Joha Salimov
                </div>
                <div
                  style={{ color: "#febb02", fontSize: 11, fontWeight: 600 }}
                >
                  Genius 1-го уровня
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <div className="header-nav">
          {NAV_ITEMS.map((item, i) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={i}
                to={item.href}
                className="header-nav-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 24,
                  border: isActive ? "2px solid #fff" : "2px solid transparent",
                  background: "transparent",
                  color: "#fff",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14,
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.borderColor = "transparent";
                }}
              >
                <Icon width={16} height={16} fill="white" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
