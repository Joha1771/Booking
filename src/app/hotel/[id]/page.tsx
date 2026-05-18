import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HotelDetailClient from "./HotelDetailClient";
import { getHotelById } from "@/lib/api/hotels";

interface Props { params: Promise<{ id: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const hotel = await getHotelById(id);
  return { title: hotel ? `${hotel.name} — Booking.com` : "Отель не найден", description: hotel?.description };
}

export default async function HotelDetailPage({ params }: Props) {
  const { id } = await params;
  const hotel = await getHotelById(id);
  if (!hotel) notFound();
  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <HotelDetailClient id={id} />
    </div>
  );
}
