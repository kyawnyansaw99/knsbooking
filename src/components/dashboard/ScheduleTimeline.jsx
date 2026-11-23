import { formatRange, nowMinutes, toMinutes } from '../../lib/time.js';
import { HOURS, pct } from '../../lib/timeline.js';
import Photo from '../ui/Photo.jsx';

/** Rooms × hours grid of today's active bookings. */
export default function ScheduleTimeline({ rooms, statuses, now }) {
  const nowPct = pct(nowMinutes(now));
  const showNow = nowPct > 0 && nowPct < 100;

  return (
    <section className="rounded-3xl bg-white shadow-soft ring-1 ring-sand-200/70">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand-100 px-5 py-4 sm:px-6">
        <div>
          <h3 className="font-display text-xl font-medium">Today’s occupancy</h3>
          <p className="text-xs text-sand-500">Live across all rooms</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-sand-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-ink-700" /> Confirmed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="bg-hatch size-2.5 rounded-sm ring-1 ring-gold-400" /> Pending
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-0.5 rounded bg-rose-500" /> Now
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[680px] px-5 py-4 sm:px-6">
          <div className="flex">
            <div className="w-44 shrink-0" />
            <div className="relative h-5 flex-1">
              {HOURS.map((h) => (
                <span
                  key={h}
                  className="absolute -translate-x-1/2 text-[11px] font-medium text-sand-400 tabular-nums first:translate-x-0 last:-translate-x-full"
                  style={{ left: `${pct(h * 60)}%` }}
                >
                  {h}:00
                </span>
              ))}
            </div>
          </div>

          <div className="mt-1 divide-y divide-sand-100">
            {rooms.map((room) => (
              <div key={room.id} className="flex items-center py-2.5">
                <div className="flex w-44 shrink-0 items-center gap-3 pr-3">
                  <Photo photo={room.photos[0]} sizes="40px" className="size-10 shrink-0 rounded-xl" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{room.name}</p>
                    <p className="text-xs text-sand-500">{room.capacity} guests</p>
                  </div>
                </div>
                <div className="relative h-11 flex-1 rounded-xl bg-sand-50">
                  {HOURS.slice(1, -1).map((h) => (
                    <span
                      key={h}
                      className="absolute inset-y-0 w-px bg-sand-200/70"
                      style={{ left: `${pct(h * 60)}%` }}
                      aria-hidden
                    />
                  ))}
                  {statuses[room.id].today.map((b) => {
                    const left = pct(toMinutes(b.start));
                    const width = pct(toMinutes(b.end)) - left;
                    const approved = b.status === 'approved';
                    return (
                      <div
                        key={b.id}
                        title={`${b.title} · ${b.requester} · ${formatRange(b.start, b.end)}${approved ? '' : ' (pending)'}`}
                        className={`absolute inset-y-1 overflow-hidden rounded-lg px-2 py-1 text-[11px] leading-tight ${
                          approved ? 'bg-ink-800 text-white' : 'bg-hatch text-gold-700 ring-1 ring-gold-400 ring-inset'
                        }`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                      >
                        <p className="truncate font-semibold">{b.title}</p>
                        <p className="truncate opacity-80">{formatRange(b.start, b.end)}</p>
                      </div>
                    );
                  })}
                  {showNow && (
                    <span
                      className="absolute -inset-y-1 z-10 w-0.5 rounded bg-rose-500"
                      style={{ left: `${nowPct}%` }}
                      aria-hidden
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
