import { Suspense } from "react";
import FlightsBookingPageClient from "./FlightsBookingPageClient";

export default function FlightsBookingPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <FlightsBookingPageClient />
    </Suspense>
  );
}
