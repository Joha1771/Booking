import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Booking.com — отели, авиабилеты, аренда авто",
  description: "Бронируйте отели, авиабилеты, аренду авто и варианты досуга по всему миру.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
