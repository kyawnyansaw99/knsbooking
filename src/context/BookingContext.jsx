import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { EQUIPMENT, ROOMS, seedBookings } from '../data/seed.js';
import { validateBooking } from '../lib/bookings.js';
import { loadBookings, saveBookings } from '../lib/storage.js';

const BookingContext = createContext(null);
const catalog = { rooms: ROOMS, equipment: EQUIPMENT };

function reducer(state, action) {
  switch (action.type) {
    case 'add':
      return [...state, action.booking];
    case 'setStatus':
      return state.map((b) =>
        b.id === action.id ? { ...b, status: action.status, updatedAt: new Date().toISOString() } : b,
      );
    case 'reset':
      return action.bookings;
    default:
      return state;
  }
}

export function BookingProvider({ children }) {
  const [bookings, dispatch] = useReducer(reducer, null, () => loadBookings() ?? seedBookings());

  useEffect(() => saveBookings(bookings), [bookings]);

  /** Validates and stores a new request as 'pending'. Returns the validation result. */
  const createBooking = useCallback(
    (input) => {
      const candidate = {
        ...input,
        id: crypto.randomUUID(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      const result = validateBooking(candidate, bookings, catalog);
      if (result.ok) dispatch({ type: 'add', booking: candidate });
      return { ...result, booking: result.ok ? candidate : null };
    },
    [bookings],
  );

  const approveBooking = useCallback((id) => dispatch({ type: 'setStatus', id, status: 'approved' }), []);
  const rejectBooking = useCallback((id) => dispatch({ type: 'setStatus', id, status: 'rejected' }), []);
  const cancelBooking = useCallback((id) => dispatch({ type: 'setStatus', id, status: 'cancelled' }), []);
  const resetDemoData = useCallback(() => dispatch({ type: 'reset', bookings: seedBookings() }), []);

  const value = useMemo(
    () => ({
      ...catalog,
      bookings,
      createBooking,
      approveBooking,
      rejectBooking,
      cancelBooking,
      resetDemoData,
    }),
    [bookings, createBooking, approveBooking, rejectBooking, cancelBooking, resetDemoData],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookings must be used inside <BookingProvider>');
  return ctx;
}
