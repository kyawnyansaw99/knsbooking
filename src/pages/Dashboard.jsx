import { useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useBookings } from '../context/BookingContext.jsx';
import { useNow } from '../hooks/useNow.js';
import {
  bookingsFor,
  defaultSlot,
  equipmentInUse,
  isAvailable,
  roomStatus,
  validateBooking,
} from '../lib/bookings.js';
import { formatRange, relativeDay, todayISO } from '../lib/time.js';
import { SectionHeading } from '../components/layout/PageHeader.jsx';
import HeroSearch from '../components/dashboard/HeroSearch.jsx';
import RoomCard from '../components/dashboard/RoomCard.jsx';
import EquipmentPanel from '../components/dashboard/EquipmentPanel.jsx';

// Public "Find Rooms" page. Operational views (stats, occupancy, approvals) live on /admin.

const CAPACITY_FILTERS = [0, 1, 2, 3, 4, 5, 6];

const toolbarControl =
  'h-11 rounded-full border border-sand-200 bg-white text-sm font-medium text-ink-900 shadow-xs transition hover:border-sand-300 focus:border-ink-500 focus:ring-4 focus:ring-ink-100 focus:outline-none';

export default function Dashboard() {
  const { rooms, equipment, bookings } = useBookings();
  const now = useNow();
  const today = todayISO(now);
  const catalog = useMemo(() => ({ rooms, equipment }), [rooms, equipment]);
  const roomsRef = useRef(null);

  // Hero search: `draft` is what's in the form, `search` is the applied window.
  const [draft, setDraft] = useState(() => ({ ...defaultSlot(new Date()), guests: 2 }));
  const [search, setSearch] = useState(null);
  const [searchError, setSearchError] = useState('');

  const [query, setQuery] = useState('');
  const [minCapacity, setMinCapacity] = useState(0);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Live room status and experience usage, recomputed with bookings + current time.
  const { statuses, inUse } = useMemo(
    () => ({
      statuses: Object.fromEntries(rooms.map((r) => [r.id, roomStatus(r.id, bookings, now)])),
      inUse: Object.fromEntries(equipment.map((e) => [e.id, equipmentInUse(e.id, bookings, now)])),
    }),
    [rooms, equipment, bookings, now],
  );

  const runSearch = () => {
    // Reuse the booking validator for the date/time rules only.
    const probe = { ...draft, resourceType: 'room', resourceId: rooms[0].id, title: '-', requester: '-' };
    const { errors } = validateBooking(probe, [], catalog, new Date());
    if (errors.time) {
      setSearchError(errors.time);
      return;
    }
    setSearchError('');
    setSearch(draft);
    setMinCapacity(draft.guests);
    roomsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearSearch = () => {
    setSearch(null);
    setMinCapacity(0);
  };

  // Card status: live "right now" by default, or availability for the searched window.
  const cardStatus = (room) => {
    if (!search) return statuses[room.id];
    const free = isAvailable({ ...search, resourceType: 'room', resourceId: room.id }, bookings, catalog);
    return { state: free ? 'free' : 'busy', window: search, today: bookingsFor('room', room.id, search.date, bookings) };
  };

  const bookHref = (room) => {
    const p = new URLSearchParams({ type: 'room', id: room.id });
    if (search) {
      p.set('date', search.date);
      p.set('start', search.start);
      p.set('end', search.end);
      p.set('guests', String(search.guests));
    }
    return `/book?${p}`;
  };

  const roomCards = rooms
    .map((room) => ({ room, status: cardStatus(room) }))
    .filter(
      ({ room, status }) =>
        room.capacity >= minCapacity &&
        (!onlyAvailable || status.state === 'free') &&
        `${room.name} ${room.view} ${room.bed} ${room.amenities.join(' ')}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    );

  const avgRating = (rooms.reduce((n, r) => n + r.rating, 0) / rooms.length).toFixed(1);

  return (
    <>
      <HeroSearch
        value={draft}
        onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
        onSubmit={runSearch}
        error={searchError}
        stats={[
          { label: 'Rooms & villas', value: rooms.length },
          { label: 'Guest rating', value: `${avgRating} / 5` },
          { label: 'Experiences', value: equipment.length },
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-16 px-4 pt-14 sm:px-6 lg:space-y-24 lg:px-8 lg:pt-20">
        {/* Rooms */}
        <section ref={roomsRef} className="scroll-mt-24 space-y-6" aria-labelledby="rooms-heading">
          <SectionHeading
            id="rooms-heading"
            eyebrow="Rooms & villas"
            title={search ? 'Available for your stay' : 'Find your sanctuary'}
            description={
              search
                ? `${relativeDay(search.date, today)} · ${formatRange(search.start, search.end)} · ${search.guests} ${search.guests === 1 ? 'guest' : 'guests'}`
                : 'Live room status, refreshed every 30 seconds.'
            }
            actions={
              search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="inline-flex items-center gap-1.5 self-start rounded-full bg-gold-50 px-4 py-2 text-sm font-semibold text-gold-700 ring-1 ring-gold-200 transition hover:bg-gold-100 md:self-auto"
                >
                  <X className="size-3.5" aria-hidden /> Clear search
                </button>
              )
            }
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="relative sm:flex-1 lg:max-w-sm">
              <span className="sr-only">Search rooms</span>
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-sand-400" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, view or amenity"
                className={`${toolbarControl} w-full pr-4 pl-10 placeholder:text-sand-400`}
              />
            </label>
            <div className="flex gap-2">
              <select
                value={minCapacity}
                onChange={(e) => setMinCapacity(Number(e.target.value))}
                className={`${toolbarControl} flex-1 px-4 sm:flex-none`}
                aria-label="Minimum guests"
              >
                {CAPACITY_FILTERS.map((n) => (
                  <option key={n} value={n}>
                    {n === 0 ? 'Any size' : `${n}+ ${n === 1 ? 'guest' : 'guests'}`}
                  </option>
                ))}
              </select>
              <label
                className={`${toolbarControl} inline-flex flex-1 cursor-pointer items-center justify-center gap-2 px-4 select-none focus-within:ring-4 focus-within:ring-ink-100 sm:flex-none ${
                  onlyAvailable ? 'border-ink-800 bg-ink-900 text-white hover:border-ink-800' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="sr-only"
                />
                <span
                  className={`size-2 rounded-full ${onlyAvailable ? 'bg-gold-300' : 'bg-emerald-500'}`}
                  aria-hidden
                />
                {search ? 'Available only' : 'Available now'}
              </label>
            </div>
          </div>

          {roomCards.length ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {roomCards.map(({ room, status }) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  status={status}
                  now={!search || search.date === today ? now : null}
                  bookHref={bookHref(room)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-sand-300 bg-white px-6 py-16 text-center">
              <p className="font-display text-xl">No rooms match your search</p>
              <p className="mt-1 text-sm text-sand-500">Try fewer guests, another time, or clear the filters.</p>
            </div>
          )}
        </section>

        {/* Experiences */}
        <section className="space-y-6" aria-labelledby="exp-heading">
          <SectionHeading
            id="exp-heading"
            eyebrow="Experiences"
            title="Moments worth booking"
            description="Spa, cabanas, boat trips and private dining. Live availability shown on each card."
          />
          <EquipmentPanel equipment={equipment} inUse={inUse} />
        </section>
      </div>
    </>
  );
}
