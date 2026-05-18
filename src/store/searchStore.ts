"use client";
import { create } from "zustand";
import { addDays, format } from "date-fns";
import { ru } from "date-fns/locale";

interface SearchState {
  destination: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  childrenAges: number[];
  rooms: number;
  travelingForWork: boolean;
  withPets: boolean;
  showDestDropdown: boolean;
  showDatePicker: boolean;
  showGuestPicker: boolean;
  setDestination: (val: string) => void;
  setCheckIn: (date: Date) => void;
  setCheckOut: (date: Date | null) => void;
  setAdults: (n: number) => void;
  setChildren: (n: number) => void;
  setChildAge: (i: number, age: number) => void;
  setRooms: (n: number) => void;
  setTravelingForWork: (v: boolean) => void;
  setWithPets: (v: boolean) => void;
  openDestDropdown: () => void;
  closeDestDropdown: () => void;
  openDatePicker: () => void;
  closeDatePicker: () => void;
  openGuestPicker: () => void;
  closeGuestPicker: () => void;
  closeAll: () => void;
  getDateLabel: () => string;
  getGuestLabel: () => string;
}

const useSearchStore = create<SearchState>((set, get) => ({
  destination: "",
  checkIn: addDays(new Date(), 6),
  checkOut: addDays(new Date(), 35),
  adults: 3,
  children: 1,
  childrenAges: [7],
  rooms: 1,
  travelingForWork: false,
  withPets: false,
  showDestDropdown: false,
  showDatePicker: false,
  showGuestPicker: false,

  setDestination: (val) => set({ destination: val }),
  setCheckIn: (date) => set({ checkIn: date }),
  setCheckOut: (date) => set({ checkOut: date as Date }),
  setAdults: (n) => set({ adults: Math.max(1, n) }),
  setChildren: (n) => {
    const cur = get().children;
    const ages = get().childrenAges;
    if (n > cur) set({ children: n, childrenAges: [...ages, 0] });
    else set({ children: Math.max(0, n), childrenAges: ages.slice(0, Math.max(0, n)) });
  },
  setChildAge: (i, age) => {
    const ages = [...get().childrenAges];
    ages[i] = age;
    set({ childrenAges: ages });
  },
  setRooms: (n) => set({ rooms: Math.max(1, n) }),
  setTravelingForWork: (v) => set({ travelingForWork: v }),
  setWithPets: (v) => set({ withPets: v }),
  openDestDropdown: () => set({ showDestDropdown: true, showDatePicker: false, showGuestPicker: false }),
  closeDestDropdown: () => set({ showDestDropdown: false }),
  openDatePicker: () => set({ showDatePicker: true, showDestDropdown: false, showGuestPicker: false }),
  closeDatePicker: () => set({ showDatePicker: false }),
  openGuestPicker: () => set({ showGuestPicker: true, showDestDropdown: false, showDatePicker: false }),
  closeGuestPicker: () => set({ showGuestPicker: false }),
  closeAll: () => set({ showDestDropdown: false, showDatePicker: false, showGuestPicker: false }),

  getDateLabel: () => {
    const { checkIn, checkOut } = get();
    if (!checkIn) return "Дата заезда — Дата отъезда";
    const fmt = (d: Date) => format(d, "d MMM", { locale: ru });
    if (!checkOut) return `${fmt(checkIn)} — Дата отъезда`;
    return `${fmt(checkIn)} — ${fmt(checkOut)}`;
  },

  getGuestLabel: () => {
    const { adults, children, rooms } = get();
    const parts: string[] = [];
    parts.push(`${adults} взросл${adults === 1 ? "ый" : adults < 5 ? "ых" : "ых"}`);
    if (children > 0) parts.push(`${children} ${children === 1 ? "ребёнок" : children < 5 ? "ребёнка" : "детей"}`);
    parts.push(`${rooms} ${rooms === 1 ? "номер" : rooms < 5 ? "номера" : "номеров"}`);
    return parts.join(" · ");
  },
}));

export default useSearchStore;
