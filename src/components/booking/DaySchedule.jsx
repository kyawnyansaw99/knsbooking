import { formatRange, nowMinutes, toMinutes } from '../../lib/time.js';
import { HOURS, pct } from '../../lib/timeline.js';

/** Greedy lane packing so overlapping experience bookings stack instead of hiding each other. */
function packLanes(bookings) {
  const laneEnds = [];
  const placed = bookings.map((b) => {
    let lane = laneEnds.findIndex((end) => end <= toMinutes(b.start));
    if (lane === -1) lane = laneEnds.push(0) - 1;
    laneEnds[lane] = toMinutes(b.end);
    return { ...b, lane };
  });
  return { placed, laneCount: Math.max(1, laneEnds.length) };
}

function Block({ left, width, className, title, children }) {
  return (
    <div
      title={title}
      className={`absolute inset-y-0.5 overflow-hidden rounded-lg px-2 py-1 text-[11px] leading-tight ${className}`}
      style={{ left: `${left}%`, width: `${width}%` }}
    >
      {children}
    </div>
  );
}

/**
 * One room/experience's day: existing bookings on top, the requested slot below.
 * `candidate` is null until the time inputs are valid.
 */
export default function DaySchedule({ bookings, candidate, conflictIds, hasConflict, showNow }) {
  const { placed, laneCount } = packLanes(bookings);
  const nowPct = pct(nowMinutes(new Date()));
  const ROW = 'relative h-9';

  return (
    <div>
      <div className="relative mb-1.5 h-4">
        {HOURS.filter((h) => h % 2 === 0).map((h) => (
          <span
            key={h}
            className="absolute -translate-x-1/2 text-[10px] font-medium text-sand-400 tabular-nums"
            style={{ left: `${pct(h * 60)}%` }}
          >
            {h}:00
          </span>
        ))}
      </div>

      <div className="relative space-y-1 rounded-xl bg-sand-50 p-1.5 ring-1 ring-sand-200/60">
        {HOURS.slice(1, -1).map((h) => (
          <span key={h} className="absolute inset-y-0 w-px bg-sand-200/70" style={{ left: `${pct(h * 60)}%` }} aria-hidden />
        ))}

        {Array.from({ length: laneCount }, (_, lane) => (
          <div key={lane} className={ROW}>
            {placed
              .filter((b) => b.lane === lane)
              .map((b) => {
                const left = pct(toMinutes(b.start));
                const clash = conflictIds.has(b.id);
                return (
                  <Block
                    key={b.id}
                    left={left}
                    width={pct(toMinutes(b.end)) - left}
                    title={`${b.title} · ${b.requester} · ${formatRange(b.start, b.end)} (${b.status})`}
                    className={
                      b.status === 'approved'
                        ? `bg-ink-800 text-white ${clash ? 'ring-2 ring-rose-500' : ''}`
                        : `bg-hatch text-gold-700 ring-1 ring-gold-400 ring-inset ${clash ? 'ring-2 ring-rose-500' : ''}`
                    }
                  >
                    <span className="block truncate font-semibold">{b.title}</span>
                  </Block>
                );
              })}
          </div>
        ))}

        <div className={`${ROW} border-t border-dashed border-sand-300 pt-1`}>
          {candidate && (
            <Block
              left={pct(toMinutes(candidate.start))}
              width={pct(toMinutes(candidate.end)) - pct(toMinutes(candidate.start))}
              title={`Your reservation · ${formatRange(candidate.start, candidate.end)}`}
              className={
                hasConflict
                  ? 'border-2 border-dashed border-rose-500 bg-rose-50 text-rose-700'
                  : 'border-2 border-dashed border-gold-500 bg-gold-50 text-gold-700'
              }
            >
              <span className="block truncate font-semibold">You</span>
            </Block>
          )}
        </div>

        {showNow && nowPct > 0 && nowPct < 100 && (
          <span className="absolute inset-y-0 z-10 w-0.5 bg-rose-500" style={{ left: `${nowPct}%` }} aria-hidden />
        )}
      </div>

      {bookings.length === 0 && <p className="mt-2 text-xs text-sand-500">No other reservations on this day.</p>}
    </div>
  );
}
