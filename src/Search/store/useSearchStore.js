import { create } from 'zustand'
import { addDays, format } from 'date-fns'
import { ru } from 'date-fns/locale'

const useSearchStore = create((set, get) => ({
  // Search fields
  destination: '',
  checkIn: addDays(new Date(), 6),
  checkOut: addDays(new Date(), 35),
  adults: 3,
  children: 1,
  childrenAges: [7],
  rooms: 1,
  travelingForWork: false,
  withPets: false,

  // UI state
  showDestDropdown: false,
  showDatePicker: false,
  showGuestPicker: false,

  // Actions
  setDestination: (val) => set({ destination: val }),
  setCheckIn: (date) => set({ checkIn: date }),
  setCheckOut: (date) => set({ checkOut: date }),
  setAdults: (n) => set({ adults: Math.max(1, n) }),
  setChildren: (n) => {
    const cur = get().children
    const ages = get().childrenAges
    if (n > cur) set({ children: n, childrenAges: [...ages, 0] })
    else set({ children: Math.max(0, n), childrenAges: ages.slice(0, Math.max(0, n)) })
  },
  setChildAge: (i, age) => {
    const ages = [...get().childrenAges]
    ages[i] = age
    set({ childrenAges: ages })
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
    const { checkIn, checkOut } = get()
    if (!checkIn || !checkOut) return 'Выберите даты'
    const fmt = (d) => format(d, 'd MMM', { locale: ru })
    const day = (d) => format(d, 'EEE', { locale: ru }).slice(0, 2)
    return `${day(checkIn)}, ${fmt(checkIn)} — ${day(checkOut)}, ${fmt(checkOut)}`
  },

  getGuestLabel: () => {
    const { adults, children, rooms } = get()
    const parts = []
    parts.push(`${adults} взросл${adults === 1 ? 'ый' : adults < 5 ? 'ых' : 'ых'}`)
    if (children > 0) parts.push(`· ${children} ребён${children === 1 ? 'ок' : children < 5 ? 'ка' : 'ков'}`)
    parts.push(`· ${rooms} номер${rooms === 1 ? '' : rooms < 5 ? 'а' : 'ов'}`)
    return parts.join(' ')
  },
}))

export default useSearchStore
