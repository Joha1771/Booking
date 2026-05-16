import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePopularHotels } from "../../hooks/useQueries.js";
import HotelCard from "../ui/HotelCard.jsx";
import HotelCardSkeleton from "../ui/HotelCardSkeleton.jsx";

const SCROLL_AMOUNT = 680;

export default function PopularHomesSection() {
  const { data: hotels, isLoading, error } = usePopularHotels(20);
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir * SCROLL_AMOUNT,
        behavior: "smooth",
      });
    }
  };

  return (
    <section style={{ padding: "32px 0" }}>
      <div className="site-container">
        <h2 className="section-heading">Дома, которые нравятся гостям</h2>
        <div style={{ position: "relative" }}>
          <div ref={scrollRef} className="carousel-track">
            {isLoading ? (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="carousel-item">
                    <HotelCardSkeleton />
                  </div>
                ))
            ) : error ? (
              <div style={{ color: "var(--booking-text-light)", padding: 24 }}>
                Не удалось загрузить данные
              </div>
            ) : (
              (hotels || []).map((hotel) => (
                <div key={hotel.id} className="carousel-item">
                  <HotelCard hotel={hotel} showDistance />
                </div>
              ))
            )}
          </div>
          {!isLoading && !error && (
            <button
              onClick={() => scroll(-1)}
              className="carousel-arrow carousel-arrow--left"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {!isLoading && !error && (
            <button
              onClick={() => scroll(1)}
              className="carousel-arrow carousel-arrow--right"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
