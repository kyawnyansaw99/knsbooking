import { DAY_END_HOUR, DAY_START_HOUR, formatRange, nowMinutes, toMinutes } from '../../lib/time.js';
import { pct as clampPct } from '../../lib/timeline.js';

/**
 * Compact single-row view of a room's day, used inside room cards.
 * `now` draws the current-time marker (omit for other days);
 * `highlight` outlines a requested window ({ start, end }).
 */
export default function DayStrip({ bookings, now, highlight }) {
  const nowPct = now ? clampPct(nowMinutes(now)) : 0;
  return (
    <div>
      <div className="relative h-2 overflow-hidden rounded-full bg-sand-100">
        {bookings.map((b) => {
          const left = clampPct(toMinutes(b.start));
          const width = clampPct(toMinutes(b.end)) - left;
          return (
            <span
              key={b.id}
              title={`${b.title} · ${formatRange(b.start, b.end)}`}
              className={`absolute inset-y-0 ${b.status === 'approved' ? 'bg-ink-700' : 'bg-gold-400'}`}
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          );
        })}
        {highlight && (
          <span
            className="absolute inset-y-0 rounded-full ring-2 ring-gold-500 ring-inset"
            style={{
              left: `${clampPct(toMinutes(highlight.start))}%`,
              width: `${clampPct(toMinutes(highlight.end)) - clampPct(toMinutes(highlight.start))}%`,
            }}
            aria-hidden
          />
        )}
        {nowPct > 0 && nowPct < 100 && (
          <span className="absolute inset-y-0 w-0.5 bg-rose-500" style={{ left: `${nowPct}%` }} aria-hidden />
        )}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-medium text-sand-400">
        <span>{DAY_START_HOUR}:00</span>
        <span>{DAY_END_HOUR}:00</span>
      </div>
    </div>
  );
}
