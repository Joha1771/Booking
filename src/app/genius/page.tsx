import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GeniusClient from "./GeniusClient";

export const metadata = { title: "Программа лояльности Genius — Booking.com" };

export default function GeniusPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <Header />
      <GeniusClient />
      <Footer />
    </div>
  );
}
