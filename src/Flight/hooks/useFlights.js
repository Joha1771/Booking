import { useQuery } from "react-query";
import {
  getFlights,
  getFlightAirports,
  getFlightRoutes,
} from "../api/flights.js";

export function useFlights(params) {
  return useQuery(["flights", params], () => getFlights(params), {
    staleTime: 5 * 60 * 1000,
    retry: 1,
    keepPreviousData: true,
  });
}

export function useFlightAirports(search = "") {
  return useQuery(
    ["flight-airports", search],
    () => getFlightAirports({ search }),
    {
      staleTime: 10 * 60 * 1000,
      retry: 1,
      keepPreviousData: true,
    },
  );
}

export function useFlightRoutes(params) {
  return useQuery(["flight-routes", params], () => getFlightRoutes(params), {
    staleTime: 10 * 60 * 1000,
    retry: 1,
    keepPreviousData: true,
  });
}
