import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Flight, Seat, BookingStep, PassengerForm, SearchQuery } from '@/types';

interface FlightState {
  searchQuery: SearchQuery;
  selectedFlight: Flight | null;
  selectedSeat: Seat | null;
  bookingStep: BookingStep;
  passengerForm: PassengerForm;
  optimisticSeatId: string | null;

  setSearchQuery: (q: SearchQuery) => void;
  setSelectedFlight: (f: Flight | null) => void;
  setSelectedSeat: (s: Seat | null) => void;
  setBookingStep: (step: BookingStep) => void;
  setPassengerForm: (form: PassengerForm) => void;
  setOptimisticSeatId: (id: string | null) => void;
  reset: () => void;
}

const defaultSearch: SearchQuery = { origin: '', destination: '', date: '', passengers: 1 };
const defaultPassenger: PassengerForm = { full_name: '', passport_no: '', nationality: '', dob: '' };

export const useFlightStore = create<FlightState>()(
  persist(
    (set) => ({
      searchQuery: defaultSearch,
      selectedFlight: null,
      selectedSeat: null,
      bookingStep: 'search',
      passengerForm: defaultPassenger,
      optimisticSeatId: null,

      setSearchQuery: (q) => set({ searchQuery: q }),
      setSelectedFlight: (f) => set({ selectedFlight: f }),
      setSelectedSeat: (s) => set({ selectedSeat: s, optimisticSeatId: s?.id ?? null }),
      setBookingStep: (step) => set({ bookingStep: step }),
      setPassengerForm: (form) => set({ passengerForm: form }),
      setOptimisticSeatId: (id) => set({ optimisticSeatId: id }),
      reset: () => set({
        selectedFlight: null,
        selectedSeat: null,
        bookingStep: 'search',
        passengerForm: defaultPassenger,
        optimisticSeatId: null,
      }),
    }),
    {
      name: 'flight-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedFlight: state.selectedFlight,
        selectedSeat: state.selectedSeat,
        bookingStep: state.bookingStep,
        // passport_no is intentionally excluded — stored in passengerForm but not persisted
        passengerForm: {
          full_name: state.passengerForm.full_name,
          nationality: state.passengerForm.nationality,
          dob: state.passengerForm.dob,
          passport_no: '', // excluded from localStorage
        },
      }),
    }
  )
);
