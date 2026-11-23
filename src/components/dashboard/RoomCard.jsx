import { Link } from 'react-router-dom';
import { ArrowRight, BedDouble, Maximize2, Star, Users } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge.jsx';
import Photo from '../ui/Photo.jsx';
import DayStrip from './DayStrip.jsx';
import { formatRange, formatTime, relativeDay } from '../../lib/time.js';

function statusLine({ state, current, next, window }) {
  if (window) {
    return state === 'free'
      ? { text: `Available ${relativeDay(window.date)}, ${formatRange(window.start, window.end)}`, tone: 'text-emerald-700' }
      : { text: 'Already reserved during your time', tone: 'text-rose-700' };
  }
  if (state === 'busy') return { text: `${current.title} · until ${formatTime(current.end)}`, tone: 'text-rose-700' };
  if (state === 'held') return { text: `Pending request · until ${formatTime(current.end)}`, tone: 'text-gold-700' };
  if (next) return { text: `Free until ${formatTime(next.start)}`, tone: 'text-emerald-700' };
  return { text: 'Free for the rest of the day', tone: 'text-emerald-700' };
}

export default function RoomCard({ room, status, now, bookHref }) {
  const line = statusLine(status);
  const [main, detail] = room.photos;

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-sand-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Photo
          photo={main}
          sizes="(min-width: 1280px) 400px, (min-width: 640px) 50vw, 100vw"
          className="size-full transition duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink-950/70 via-ink-950/0 to-ink-950/10" aria-hidden />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between">
          <StatusBadge status={status.state} onImage />
          <span className="inline-flex items-center gap-1 rounded-full bg-ink-950/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
            <Star className="size-3 fill-gold-300 text-gold-300" aria-hidden />
            {room.rating.toFixed(1)}
          </span>
        </div>
        {detail && (
          <Photo
            photo={detail}
            sizes="96px"
            className="absolute right-3 bottom-3 hidden h-14 w-20 rounded-lg ring-2 ring-white/90 sm:block"
          />
        )}
        <p className="absolute bottom-3 left-4 text-xs font-semibold tracking-wide text-white/90 uppercase">
          {room.view}
        </p>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-medium tracking-tight text-ink-950">{room.name}</h3>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-sand-600">
          <li className="inline-flex items-center gap-1.5">
            <BedDouble className="size-4 text-sand-400" aria-hidden /> {room.bed}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Maximize2 className="size-3.5 text-sand-400" aria-hidden /> {room.size} m²
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Users className="size-4 text-sand-400" aria-hidden /> Up to {room.capacity}
          </li>
        </ul>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {room.amenities.map((a) => (
            <li key={a} className="rounded-full bg-sand-100 px-2.5 py-1 text-xs font-medium text-sand-700">
              {a}
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-2xl bg-sand-50 p-3.5 ring-1 ring-sand-200/60">
          <p className={`truncate text-sm font-semibold ${line.tone}`}>{line.text}</p>
          <div className="mt-2.5">
            <DayStrip bookings={status.today} now={now} highlight={status.window} />
          </div>
        </div>

        <Link
          to={bookHref}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 px-4 py-3 text-sm font-semibold text-white transition group-hover:bg-ink-800 hover:bg-ink-700"
        >
          Reserve this room
          <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
