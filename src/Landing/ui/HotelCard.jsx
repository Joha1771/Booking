import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";

function Stars({ count }) {
  if (!count) return null;
  return (
    <span style={{ color: "#f5a623", fontSize: 12 }}>
      {"★".repeat(Math.min(count, 5))}
    </span>
  );
}

function GeniusBadge() {
  return (
    <span
      style={{
        background: "var(--booking-blue)",
        color: "#fff",
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 6px",
        borderRadius: 2,
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      Genius
    </span>
  );
}

function ScoreBadge({ score }) {
  return (
    <div
      style={{
        background: "var(--booking-blue)",
        color: "#fff",
        fontWeight: 700,
        fontSize: 14,
        padding: "5px 8px",
        borderRadius: "4px 4px 4px 0",
        display: "inline-block",
        minWidth: 36,
        textAlign: "center",
      }}
    >
      {score}
    </div>
  );
}

// Normalize both mock data and Supabase schema
function normalizeHotel(hotel) {
  return {
    id: hotel.id,
    name: hotel.name,
    location:
      hotel.location || [hotel.city, hotel.country].filter(Boolean).join(", "),
    type: hotel.type || hotel.category || "Отель",
    stars: hotel.stars || 0,
    rating: hotel.rating || 0,
    ratingLabel: hotel.ratingLabel || getRatingLabel(hotel.rating),
    reviews: hotel.reviews || hotel.reviews_count || 0,
    distance:
      hotel.distance ||
      (hotel.distance_center ? `${hotel.distance_center} км от центра` : null),
    priceOld: hotel.priceOld || hotel.original_price || null,
    price: hotel.price || hotel.price_per_night || 0,
    priceFrom: hotel.priceFrom || false,
    genius: hotel.genius ?? hotel.is_genius ?? false,
    image:
      hotel.image ||
      hotel.image_url ||
      `https://picsum.photos/seed/${hotel.id}/300/200`,
    nights: hotel.nights || 2,
  };
}

function getRatingLabel(rating) {
  if (!rating) return "";
  if (rating >= 9.5) return "Великолепно";
  if (rating >= 9.0) return "Превосходно";
  if (rating >= 8.5) return "Потрясающе";
  if (rating >= 8.0) return "Очень хорошо";
  if (rating >= 7.0) return "Хорошо";
  return "Неплохо";
}

export default function HotelCard({
  hotel: rawHotel,
  showDistance = false,
  showNights = false,
}) {
  const hotel = normalizeHotel(rawHotel);
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  const fmt = (p) => Math.round(p).toLocaleString("ru-RU");

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--booking-border)",
        borderRadius: 8,
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 0.15s",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      onClick={() => navigate(`/hotel/${hotel.id}`)}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Image */}
      <div className="hotel-card-image">
        <img
          src={hotel.image}
          alt={hotel.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = `https://picsum.photos/seed/${hotel.id}/300/200`;
          }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            background: "rgba(255,255,255,0.9)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            border: "none",
          }}
        >
          <Heart
            size={16}
            fill={liked ? "#e00" : "none"}
            color={liked ? "#e00" : "#333"}
          />
        </button>
        {hotel.genius && (
          <div style={{ position: "absolute", bottom: 8, left: 8 }}>
            <GeniusBadge />
          </div>
        )}
      </div>

      {/* Info */}
      <div
        style={{
          padding: "10px 12px 12px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 2,
          }}
        >
          <span style={{ fontSize: 11, color: "var(--booking-text-light)" }}>
            {hotel.type}
          </span>
          {hotel.stars > 0 && <Stars count={hotel.stars} />}
          {hotel.genius && <GeniusBadge />}
        </div>

        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--booking-blue-light)",
            marginBottom: 2,
            lineHeight: 1.3,
          }}
        >
          {hotel.name}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--booking-text-light)",
            marginBottom: 6,
          }}
        >
          {hotel.location}
        </div>

        <div className="hotel-card-rating-row">
          {hotel.rating > 0 && <ScoreBadge score={hotel.rating} />}
          {hotel.ratingLabel && (
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {hotel.ratingLabel}
            </span>
          )}
          {hotel.reviews > 0 && (
            <span style={{ fontSize: 12, color: "var(--booking-text-light)" }}>
              {hotel.reviews.toLocaleString("ru-RU")} отзывов
            </span>
          )}
        </div>

        {showDistance && hotel.distance && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: "var(--booking-text-light)",
              marginBottom: 8,
            }}
          >
            <MapPin size={12} />
            {hotel.distance}
          </div>
        )}

        <div className="hotel-card-price">
          {hotel.priceOld && (
            <div
              style={{
                fontSize: 12,
                color: "var(--booking-text-light)",
                textDecoration: "line-through",
              }}
            >
              {showNights ? `${hotel.nights} ноч ` : ""}UZS{" "}
              {fmt(hotel.priceOld)}
            </div>
          )}
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {hotel.priceFrom ? "От " : showNights ? `${hotel.nights} ноч ` : ""}
            UZS {fmt(hotel.price)}
          </div>
        </div>
      </div>
    </div>
  );
}
