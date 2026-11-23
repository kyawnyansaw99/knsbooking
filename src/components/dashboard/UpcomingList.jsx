import { ArrowRight } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge.jsx';
import Photo from '../ui/Photo.jsx';
import { formatRange, relativeDay, todayISO } from '../../lib/time.js';

/** `resourceOf(b)` returns the room/experience record for a booking. */
export default function UpcomingList({ bookings, resourceOf, now, limit = 6, viewAllHref }) {
  const today = todayISO(now);
  const items = bookings.slice(0, limit);

  return (
    <section className="flex h-full flex-col rounded-3xl bg-white shadow-soft ring-1 ring-sand-200/70">
      <div className="flex items-center justify-between border-b border-sand-100 px-5 py-4 sm:px-6">
        <div>
          <h3 className="font-display text-xl font-medium">Arriving next</h3>
          <p className="text-xs text-sand-500">Upcoming reservations</p>
        </div>
        {viewAllHref && (
          <a
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-sm font-semibold text-ink-700 hover:text-gold-600"
          >
            View all <ArrowRight className="size-3.5" aria-hidden />
          </a>
        )}
      </div>
      {items.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-sand-500">Nothing reserved yet.</p>
      ) : (
        <ul className="divide-y divide-sand-100">
          {items.map((b) => {
            const resource = resourceOf(b);
            const photo = resource?.photos?.[0] ?? resource?.photo;
            return (
              <li key={b.id} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
                <Photo photo={photo} sizes="48px" className="size-12 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{b.title}</p>
                    <StatusBadge status={b.status} className="shrink-0" />
                  </div>
                  <p className="truncate text-xs text-sand-500">
                    {resource?.name ?? 'Unknown'} · {b.requester}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-ink-700">
                    {relativeDay(b.date, today)} · {formatRange(b.start, b.end)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
