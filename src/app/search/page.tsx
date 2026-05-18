"use client";
import { Suspense } from "react";
import SearchResultsClient from "./SearchResultsClient";

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Загрузка...</div>}>
      <SearchResultsClient />
    </Suspense>
  );
}
