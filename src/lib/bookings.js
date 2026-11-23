import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  SLOT_MINUTES,
  addDays,
  fromMinutes,
  nowMinutes,
  toMinutes,
  todayISO,
} from './time.js';

/** Statuses that hold a slot. Cancelled/rejected bookings free the slot again. */
export const ACTIVE_STATUSES = ['pending', 'approved'];

export const isActive = (b) => ACTIVE_STATUSES.includes(b.status);

/** Half-open interval overlap: a 10:00–11:00 booking does not clash with 11:00–12:00. */
export function overlaps(a, b) {
  return (
    a.date === b.date &&
    toMinutes(a.start) < toMinutes(b.end) &&
    toMinutes(a.end) > toMinutes(b.start)
  );
}

/** Active bookings on the same resource that overlap the candidate. */
export function findConflicts(candidate, bookings) {
  return bookings.filter(
    (b) =>
      b.id !== candidate.id &&
      b.resourceType === candidate.resourceType &&
      b.resourceId === candidate.resourceId &&
      isActive(b) &&
      overlaps(b, candidate),
  );
}

/**
 * Highest number of `bookings` running at the same moment inside `window`.
 * Concurrency can only rise at a start time, so checking the window start plus
 * every booking start inside the window is enough.
 */
export function peakConcurrency(window, bookings) {
  const from = toMinutes(window.start);
  const to = toMinutes(window.end);
  const points = [from, ...bookings.map((b) => toMinutes(b.start))].filter(
    (p) => p >= from && p < to,
  );
  return points.reduce((peak, p) => {
    const running = bookings.filter((b) => toMinutes(b.start) <= p && p < toMinutes(b.end)).length;
    return Math.max(peak, running);
  }, 0);
}

export function findResource(type, id, { rooms, equipment }) {
  return (type === 'room' ? rooms : equipment).find((r) => r.id === id);
}

export const MAX_DAYS_AHEAD = 90;

/** Next free quarter-hour today (1 h long), or 9:00 tomorrow if the day is nearly over. */
export function defaultSlot(now = new Date()) {
  const dayStart = DAY_START_HOUR * 60;
  const dayEnd = DAY_END_HOUR * 60;
  let date = todayISO(now);
  let start = Math.ceil(nowMinutes(now) / SLOT_MINUTES) * SLOT_MINUTES;
  if (start < dayStart) start = dayStart + 60;
  if (start + 60 > dayEnd) {
    date = addDays(date, 1);
    start = dayStart + 60;
  }
  return { date, start: fromMinutes(start), end: fromMinutes(start + 60) };
}

/** How many simultaneous bookings a resource allows (rooms are exclusive). */
export function resourceCapacity(type, resource) {
  return type === 'equipment' ? resource.quantity : 1;
}

/**
 * Units still free for the candidate's whole time window
 * (0 = fully booked; rooms return 0 or 1).
 */
export function freeUnits(candidate, bookings, catalog) {
  const resource = findResource(candidate.resourceType, candidate.resourceId, catalog);
  if (!resource) return 0;
  const used = peakConcurrency(candidate, findConflicts(candidate, bookings));
  return Math.max(0, resourceCapacity(candidate.resourceType, resource) - used);
}

export const isAvailable = (candidate, bookings, catalog) => freeUnits(candidate, bookings, catalog) > 0;

/**
 * Validates a booking request. Rooms are exclusive; equipment can be booked
 * concurrently up to its `quantity`.
 * Errors are keyed by field so the form can show each one in the right place:
 * title | requester | resourceId | attendees | time | conflict
 * @returns {{ ok: boolean, errors: Record<string, string>, conflicts: object[] }}
 */
export function validateBooking(candidate, bookings, catalog, now = new Date()) {
  const errors = {};
  const { title, requester, date, start, end, resourceType, resourceId, attendees } = candidate;

  if (!title?.trim()) errors.title = 'Add a title for the booking.';
  if (!requester?.trim()) errors.requester = 'Add who the booking is for.';

  const resource = findResource(resourceType, resourceId, catalog);
  if (!resource) errors.resourceId = 'Choose a room or piece of equipment.';

  if (resource && resourceType === 'room' && attendees > resource.capacity) {
    errors.attendees = `${resource.name} fits up to ${resource.capacity} people.`;
  }

  const today = todayISO(now);
  if (!date || !start || !end) {
    errors.time = 'Pick a date, start time and end time.';
  } else if (toMinutes(end) <= toMinutes(start)) {
    errors.time = 'End time must be after the start time.';
  } else if (date < today || (date === today && toMinutes(start) < nowMinutes(now))) {
    errors.time = 'That time has already passed.';
  } else if (date > addDays(today, MAX_DAYS_AHEAD)) {
    errors.time = `Bookings can be made up to ${MAX_DAYS_AHEAD} days ahead.`;
  }

  // Conflicts are checked whenever the resource and time are valid, even if
  // other fields are still empty, so the form can warn about clashes live.
  let conflicts = [];
  if (resource && !errors.time) {
    conflicts = findConflicts(candidate, bookings);
    const capacity = resourceCapacity(resourceType, resource);
    if (peakConcurrency(candidate, conflicts) >= capacity) {
      errors.conflict =
        resourceType === 'room'
          ? `${resource.name} is already booked for part of that time.`
          : `All ${capacity} × ${resource.name} are booked for part of that time.`;
    }
  }

  return { ok: Object.keys(errors).length === 0, errors, conflicts };
}

const byStart = (a, b) => toMinutes(a.start) - toMinutes(b.start);

/**
 * Free slots of the same length on the same day and resource, closest to the
 * requested start time first, then returned in chronological order.
 */
export function suggestSlots(candidate, bookings, catalog, now = new Date(), limit = 3) {
  const { date, start, end } = candidate;
  const duration = toMinutes(end) - toMinutes(start);
  const today = todayISO(now);
  if (duration <= 0 || !date || date < today) return [];

  const dayStart = DAY_START_HOUR * 60;
  const dayEnd = DAY_END_HOUR * 60;
  const earliest =
    date === today ? Math.max(dayStart, Math.ceil(nowMinutes(now) / SLOT_MINUTES) * SLOT_MINUTES) : dayStart;
  const wanted = toMinutes(start);

  const slots = [];
  for (let m = earliest; m + duration <= dayEnd; m += SLOT_MINUTES) {
    if (m === wanted) continue;
    const slot = { ...candidate, start: fromMinutes(m), end: fromMinutes(m + duration) };
    if (isAvailable(slot, bookings, catalog)) slots.push(slot);
  }

  return slots
    .sort((a, b) => Math.abs(toMinutes(a.start) - wanted) - Math.abs(toMinutes(b.start) - wanted))
    .slice(0, limit)
    .sort(byStart);
}

/** Other rooms free for the same time that fit the group, smallest first. */
export function alternativeRooms(candidate, bookings, catalog, limit = 3) {
  if (candidate.resourceType !== 'room') return [];
  const needed = candidate.attendees || 0;
  return catalog.rooms
    .filter(
      (r) =>
        r.id !== candidate.resourceId &&
        r.capacity >= needed &&
        isAvailable({ ...candidate, resourceId: r.id }, bookings, catalog),
    )
    .sort((a, b) => a.capacity - b.capacity)
    .slice(0, limit);
}

/** Active bookings for one resource on one date, sorted by start time. */
export function bookingsFor(resourceType, resourceId, date, bookings) {
  return bookings
    .filter((b) => b.resourceType === resourceType && b.resourceId === resourceId && b.date === date && isActive(b))
    .sort(byStart);
}

/**
 * Live status of a room right now.
 * state: 'free' | 'busy' (approved meeting running) | 'held' (pending request running)
 */
export function roomStatus(roomId, bookings, now = new Date()) {
  const m = nowMinutes(now);
  const todays = bookingsFor('room', roomId, todayISO(now), bookings);

  const current = todays.find((b) => toMinutes(b.start) <= m && m < toMinutes(b.end));
  const next = todays.find((b) => toMinutes(b.start) > m);
  const state = !current ? 'free' : current.status === 'approved' ? 'busy' : 'held';

  return { state, current, next, today: todays };
}

/** How many units of an equipment item are out on approved bookings right now. */
export function equipmentInUse(equipmentId, bookings, now = new Date()) {
  const today = todayISO(now);
  const m = nowMinutes(now);
  return bookings.filter(
    (b) =>
      b.resourceType === 'equipment' &&
      b.resourceId === equipmentId &&
      b.status === 'approved' &&
      b.date === today &&
      toMinutes(b.start) <= m &&
      m < toMinutes(b.end),
  ).length;
}

/** Sort comparator: earliest date, then earliest start time. */
export function compareDateTime(a, b) {
  return a.date === b.date ? byStart(a, b) : a.date < b.date ? -1 : 1;
}

/** True once the booking's end time has passed. */
export function hasEnded(b, now = new Date()) {
  const today = todayISO(now);
  return b.date < today || (b.date === today && toMinutes(b.end) <= nowMinutes(now));
}

/** Active bookings that haven't ended yet, soonest first. */
export function upcomingBookings(bookings, now = new Date()) {
  return bookings.filter((b) => isActive(b) && !hasEnded(b, now)).sort(compareDateTime);
}

/**
 * Admin actions allowed for a booking right now.
 * Pending → approve (if not over) / decline; approved & not over → cancel.
 */
export function allowedActions(b, now = new Date()) {
  const over = hasEnded(b, now);
  if (b.status === 'pending') return over ? ['decline'] : ['approve', 'decline'];
  if (b.status === 'approved' && !over) return ['cancel'];
  return [];
}
