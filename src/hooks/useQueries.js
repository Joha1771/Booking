import { useQuery, useMutation, useQueryClient } from "react-query";
export { useFlights } from "../Flight/hooks/useFlights.js";

import {
  getPopularHotels,
  getWeekendHotels,
  getUniqueHotels,
  searchHotels,
  getHotelById,
  getTrendingDestinations,
  getDestinationsByRegion,
  searchDestinations,
  getAllDestinations,
  getCars,
  createBooking,
  getUserBookings,
  cancelBooking,
} from "../lib/api.js";

// ─── HOTELS ──────────────────────────────────────────────────

export function usePopularHotels(limit = 8) {
  return useQuery(
    ["hotels", "popular", limit],
    () => getPopularHotels({ limit }),
    { staleTime: 5 * 60 * 1000, retry: 1 },
  );
}

export function useWeekendHotels(limit = 4) {
  return useQuery(
    ["hotels", "weekend", limit],
    () => getWeekendHotels({ limit }),
    { staleTime: 5 * 60 * 1000, retry: 1 },
  );
}

export function useUniqueHotels(limit = 4) {
  return useQuery(
    ["hotels", "unique", limit],
    () => getUniqueHotels({ limit }),
    { staleTime: 5 * 60 * 1000, retry: 1 },
  );
}

export function useSearchHotels(params) {
  return useQuery(["hotels", "search", params], () => searchHotels(params), {
    enabled: !!params?.destination,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

export function useHotel(id) {
  return useQuery(["hotel", id], () => getHotelById(id), {
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

// ─── DESTINATIONS ─────────────────────────────────────────────

export function useTrendingDestinations() {
  return useQuery(["destinations", "trending"], getTrendingDestinations, {
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useDestinationsByRegion(region) {
  return useQuery(
    ["destinations", "region", region],
    () => getDestinationsByRegion(region),
    { enabled: !!region, staleTime: 10 * 60 * 1000, retry: 1 },
  );
}

export function useSearchDestinations(query) {
  return useQuery(
    ["destinations", "search", query],
    () => searchDestinations(query),
    {
      enabled: !!query && query.length >= 2,
      staleTime: 1 * 60 * 1000,
      retry: 1,
    },
  );
}

export function useAllDestinations(limit = 200) {
  return useQuery(
    ["destinations", "all", limit],
    () => getAllDestinations({ limit }),
    { staleTime: 10 * 60 * 1000, retry: 1 },
  );
}

// ─── CARS ─────────────────────────────────────────────────────

export function useCars(category) {
  return useQuery(["cars", category], () => getCars({ category }), {
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

// ─── BOOKINGS ─────────────────────────────────────────────────

export function useUserBookings(userId) {
  return useQuery(["bookings", userId], () => getUserBookings(userId), {
    enabled: !!userId,
    retry: 1,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation(createBooking, {
    onSuccess: () => {
      queryClient.invalidateQueries("bookings");
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation(
    ({ bookingId, userId }) => cancelBooking(bookingId, userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("bookings");
      },
    },
  );
}
