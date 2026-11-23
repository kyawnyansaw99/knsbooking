import { useMemo, useState } from 'react';
import { MessageSquareText, Search, Users } from 'lucide-react';
import Photo from '../ui/Photo.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import BookingActions from './BookingActions.jsx';
import { compareDateTime, hasEnded } from '../../lib/bookings.js';
import { formatRange, relativeDay, todayISO } from '../../lib/time.js';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Declined' },
];

const WHEN_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'today', label: 'Today' },
  { value: 'past', label: 'Past' },
  { value: 'all', label: 'Any date' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'Rooms & experiences' },
  { value: 'room', label: 'Rooms only' },
  { value: 'equipment', label: 'Experiences only' },
];

const PAGE_SIZE = 10;

const control =
  'h-11 rounded-full border border-sand-200 bg-white text-sm font-medium text-ink-900 shadow-xs transition hover:border-sand-300 focus:border-ink-500 focus:ring-4 focus:ring-ink-100 focus:outline-none';

// Shared column template so the header lines up with the rows on desktop.
const COLS = 'lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.5fr)_minmax(0,1fr)_7rem_minmax(14rem,auto)] lg:items-center lg:gap-4';

export default function ReservationsTable({ bookings, resourceOf, now, onAction }) {
  const [status, setStatus] = useState('all');
  const [when, setWhen] = useState('upcoming');
  const [type, setType] = useState('all');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);

  const today = todayISO(now);

  // Filters other than status, so the tabs can show counts for each status.
  const scoped = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (type !== 'all' && b.resourceType !== type) return false;
      if (when === 'today' && b.date !== today) return false;
      if (when === 'upcoming' && hasEnded(b, now)) return false;
      if (when === 'past' && !hasEnded(b, now)) return false;
      if (!q) return true;
      const name = resourceOf(b)?.name ?? '';
      return `${b.title} ${b.requester} ${name} ${b.notes ?? ''}`.toLowerCase().includes(q);
    });
  }, [bookings, type, when, query, today, now, resourceOf]);

  const counts = useMemo(() => {
    const c = { all: scoped.length };
    for (const b of scoped) c[b.status] = (c[b.status] ?? 0) + 1;
    return c;
  }, [scoped]);

  const rows = useMemo(() => {
    const list = status === 'all' ? scoped : scoped.filter((b) => b.status === status);
    const sorted = [...list].sort(compareDateTime);
    // Newest first when looking backwards in time.
    return when === 'past' || when === 'all' ? sorted.reverse() : sorted;
  }, [scoped, status, when]);

  const visible = rows.slice(0, limit);
  const resetPaging = (fn) => (value) => {
    fn(value);
    setLimit(PAGE_SIZE);
  };

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-sand-200/70">
      {/* Filters */}
      <div className="space-y-4 border-b border-sand-100 p-4 sm:p-5">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <label className="relative lg:flex-1">
            <span className="sr-only">Search reservations</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-sand-400" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => resetPaging(setQuery)(e.target.value)}
              placeholder="Search guest, occasion, room or request"
              className={`${control} w-full pr-4 pl-10 placeholder:text-sand-400`}
            />
          </label>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <select
              value={when}
              onChange={(e) => resetPaging(setWhen)(e.target.value)}
              className={`${control} px-4`}
              aria-label="Date range"
            >
              {WHEN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={type}
              onChange={(e) => resetPaging(setType)(e.target.value)}
              className={`${control} px-4`}
              aria-label="Reservation type"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Filter by status">
          {STATUS_TABS.map((t) => {
            const active = status === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => resetPaging(setStatus)(t.value)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active ? 'bg-ink-900 text-white' : 'text-sand-600 hover:bg-sand-100 hover:text-ink-900'
                }`}
              >
                {t.label}
                <span
                  className={`rounded-full px-1.5 text-[11px] leading-5 tabular-nums ${
                    active ? 'bg-gold-400 text-ink-950' : 'bg-sand-100 text-sand-600'
                  }`}
                >
                  {counts[t.value] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Column headings (desktop) */}
      <div
        className={`hidden border-b border-sand-100 bg-sand-50 px-5 py-3 text-[11px] font-semibold tracking-[0.15em] text-sand-500 uppercase ${COLS}`}
      >
        <span>Room / experience</span>
        <span>Guest</span>
        <span>When</span>
        <span>Status</span>
        <span className="text-right">Actions</span>
      </div>

      {visible.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="font-display text-xl">No reservations found</p>
          <p className="mt-1 text-sm text-sand-500">Try another status, date range or search.</p>
        </div>
      ) : (
        <ul className="divide-y divide-sand-100">
          {visible.map((b) => {
            const resource = resourceOf(b);
            const photo = resource?.photos?.[0] ?? resource?.photo;
            return (
              <li key={b.id} className={`grid gap-3 px-4 py-4 sm:px-5 ${COLS}`}>
                <div className="flex min-w-0 items-center gap-3">
                  <Photo photo={photo} sizes="56px" className="size-14 shrink-0 rounded-xl" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{resource?.name ?? 'Unknown'}</p>
                    <p className="text-xs text-sand-500">{b.resourceType === 'room' ? 'Room' : 'Experience'}</p>
                  </div>
                  <StatusBadge status={b.status} className="ml-auto shrink-0 lg:hidden" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{b.title}</p>
                  <p className="flex flex-wrap items-center gap-x-3 text-xs text-sand-500">
                    <span>{b.requester}</span>
                    {b.attendees ? (
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3" aria-hidden /> {b.attendees}
                      </span>
                    ) : null}
                    {b.notes && (
                      <span className="inline-flex items-center gap-1" title={b.notes}>
                        <MessageSquareText className="size-3" aria-hidden /> Request
                      </span>
                    )}
                  </p>
                </div>

                <div className="text-sm">
                  <p className="font-semibold text-ink-900">{relativeDay(b.date, today)}</p>
                  <p className="text-xs text-sand-500">{formatRange(b.start, b.end)}</p>
                </div>

                <div className="hidden lg:block">
                  <StatusBadge status={b.status} />
                </div>

                <BookingActions booking={b} now={now} onAction={onAction} className="lg:justify-end" />
              </li>
            );
          })}
        </ul>
      )}

      {rows.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-sand-100 bg-sand-50 px-5 py-4 text-sm text-sand-600 sm:flex-row">
          <span>
            Showing {visible.length} of {rows.length}
          </span>
          {rows.length > visible.length && (
            <button
              type="button"
              onClick={() => setLimit((l) => l + PAGE_SIZE)}
              className="rounded-full border border-sand-200 bg-white px-4 py-2 font-semibold text-ink-900 transition hover:border-sand-300"
            >
              Show more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
