import { CheckCircle2, MessageSquareText, Users } from 'lucide-react';
import Photo from '../ui/Photo.jsx';
import BookingActions from './BookingActions.jsx';
import { formatRange, relativeDay, todayISO } from '../../lib/time.js';
import { hasEnded } from '../../lib/bookings.js';

/** Cards for every pending request, oldest-first by date/time. */
export default function PendingQueue({ bookings, resourceOf, now, onAction }) {
  const today = todayISO(now);

  if (!bookings.length) {
    return (
      <div className="flex items-center gap-4 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-sand-200/70">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-6" aria-hidden />
        </span>
        <div>
          <p className="font-display text-lg">All caught up</p>
          <p className="text-sm text-sand-500">There are no requests waiting for confirmation.</p>
        </div>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {bookings.map((b) => {
        const resource = resourceOf(b);
        const photo = resource?.photos?.[0] ?? resource?.photo;
        const over = hasEnded(b, now);
        return (
          <li
            key={b.id}
            className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-sand-200/70"
          >
            <div className="flex gap-4 p-4">
              <Photo photo={photo} sizes="96px" className="h-20 w-24 shrink-0 rounded-2xl" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold tracking-[0.15em] text-gold-600 uppercase">
                  {relativeDay(b.date, today)} · {formatRange(b.start, b.end)}
                </p>
                <p className="mt-1 truncate font-display text-lg leading-tight">{b.title}</p>
                <p className="truncate text-sm text-sand-600">{resource?.name ?? 'Unknown'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 px-4 pb-4 text-xs text-sand-600">
              <span className="font-semibold text-ink-900">{b.requester}</span>
              {b.attendees ? (
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3" aria-hidden /> {b.attendees}
                </span>
              ) : null}
              {b.notes && (
                <span className="inline-flex min-w-0 items-center gap-1" title={b.notes}>
                  <MessageSquareText className="size-3 shrink-0" aria-hidden />
                  <span className="truncate">{b.notes}</span>
                </span>
              )}
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-sand-100 bg-sand-50 px-4 py-3">
              {over ? (
                <span className="text-xs font-medium text-rose-600">Time has passed</span>
              ) : (
                <span className="text-xs text-sand-500">Slot is held</span>
              )}
              <BookingActions booking={b} now={now} onAction={onAction} className="justify-end" />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
