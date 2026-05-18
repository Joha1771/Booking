"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HotelCard from "@/components/ui/HotelCard";
import HotelCardSkeleton from "@/components/ui/HotelCardSkeleton";
import type { Hotel } from "@/types";

interface Props { hotels?: Hotel[]; isLoading?: boolean; }

const SCROLL_AMOUNT = 680;

export default function WeekendOffersSection({ hotels = [], isLoading = false }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * SCROLL_AMOUNT, behavior: "smooth" });
  };

  return (
    <section style={{ padding: "32px 0" }}>
      <div className="site-container">
        <h2 className="section-heading">Предложения на выходные</h2>
        <p className="section-subheading">Сэкономьте на жилье на 15 мая - 17 мая.</p>
        <div style={{ position: "relative" }}>
          <div ref={scrollRef} className="carousel-track">
            {isLoading
              ? Array(4).fill(0).map((_, i) => <div key={i} className="carousel-item"><HotelCardSkeleton /></div>)
              : hotels.map((hotel) => <div key={hotel.id} className="carousel-item"><HotelCard hotel={hotel as any} showNights /></div>)
            }
          </div>
          {!isLoading && <button onClick={() => scroll(-1)} className="carousel-arrow carousel-arrow--left"><ChevronLeft size={20} /></button>}
          {!isLoading && <button onClick={() => scroll(1)} className="carousel-arrow carousel-arrow--right"><ChevronRight size={20} /></button>}
        </div>
      </div>
    </section>
  );
}
