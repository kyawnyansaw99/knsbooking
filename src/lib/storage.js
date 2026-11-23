// Thin persistence layer. Swap these two functions for API calls
// (e.g. fetch('/api/bookings')) when a backend is added.

// v2: hotel catalogue (room/experience ids changed from the v1 meeting-room data).
// The key keeps its original name on purpose: renaming it would drop bookings
// already saved in visitors' browsers.
const STORAGE_KEY = 'baansabai.bookings.v2';

export function loadBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveBookings(bookings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch {
    // Storage full or blocked (private mode) – the app keeps working in memory.
  }
}
