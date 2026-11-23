import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge.jsx';
import Photo from '../ui/Photo.jsx';
import { formatDateLong, formatRange } from '../../lib/time.js';

export default function BookingSuccess({ booking, resource, onBookAnother }) {
  const photo = resource?.photos?.[0] ?? resource?.photo;
  const rows = [
    ['Occasion', booking.title],
    [booking.resourceType === 'room' ? 'Room' : 'Experience', resource?.name ?? 'Unknown'],
    ['When', `${formatDateLong(booking.date)}, ${formatRange(booking.start, booking.end)}`],
    ['Guest', booking.requester],
    ...(booking.attendees ? [['Guests', booking.attendees]] : []),
    ...(booking.notes ? [['Requests', booking.notes]] : []),
  ];

  return (
    <div className="mx-auto max-w-xl overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-sand-200/70">
      <div className="relative aspect-[16/7]">
        <Photo photo={photo} sizes="576px" eager className="size-full" />
        <div className="absolute inset-0 bg-linear-to-t from-ink-950/80 to-ink-950/10" aria-hidden />
        <div className="absolute inset-x-6 bottom-5 flex items-center gap-3 text-white">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold-400 text-ink-950">
            <CheckCircle2 className="size-6" aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-2xl leading-tight">Request received</h1>
            <p className="text-sm text-white/80">Your time is held while our team confirms it.</p>
          </div>
        </div>
      </div>

      <dl className="divide-y divide-sand-100 px-6 py-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-4 py-3">
            <dt className="w-24 shrink-0 text-sand-500">{k}</dt>
            <dd className="min-w-0 font-semibold break-words text-ink-950">{v}</dd>
          </div>
        ))}
        <div className="flex items-center gap-4 py-3">
          <dt className="w-24 shrink-0 text-sand-500">Status</dt>
          <dd>
            <StatusBadge status={booking.status} />
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2 border-t border-sand-100 bg-sand-50 px-6 py-5 sm:flex-row sm:justify-end">
        <Link
          to="/"
          className="rounded-full border border-sand-200 bg-white px-5 py-3 text-center text-sm font-semibold text-ink-900 transition hover:border-sand-300"
        >
          Back to Find Rooms
        </Link>
        <button
          type="button"
          onClick={onBookAnother}
          className="rounded-full bg-ink-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink-800"
        >
          Make another reservation
        </button>
      </div>
    </div>
  );
}
