import { CalendarDays, Clock, Search, Users } from 'lucide-react';
import Photo from '../ui/Photo.jsx';
import { PHOTOS } from '../../data/photos.js';
import { MAX_DAYS_AHEAD } from '../../lib/bookings.js';
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  SLOT_MINUTES,
  addDays,
  formatTime,
  fromMinutes,
  timeOptions,
  toMinutes,
  todayISO,
} from '../../lib/time.js';

const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6];

function SearchField({ icon: Icon, label, htmlFor, children, className = '' }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 transition focus-within:bg-sand-50 hover:bg-sand-50 ${className}`}
    >
      <Icon className="size-5 shrink-0 text-gold-500" aria-hidden />
      <div className="min-w-0 flex-1">
        <label htmlFor={htmlFor} className="block text-[11px] font-semibold tracking-wider text-sand-500 uppercase">
          {label}
        </label>
        {children}
      </div>
    </div>
  );
}

const control =
  'w-full cursor-pointer appearance-none bg-transparent text-[15px] font-semibold text-ink-950 focus:outline-none';

/**
 * Hero banner with an availability search. `value` is the draft search
 * ({ date, start, end, guests }); `onSubmit` applies it to the room list.
 */
export default function HeroSearch({ value, onChange, onSubmit, error, stats }) {
  const today = todayISO();
  const startOptions = timeOptions(DAY_START_HOUR * 60, DAY_END_HOUR * 60 - SLOT_MINUTES);
  const endOptions = timeOptions(toMinutes(value.start) + SLOT_MINUTES, DAY_END_HOUR * 60);

  const changeStart = (start) => {
    const duration = Math.max(SLOT_MINUTES, toMinutes(value.end) - toMinutes(value.start));
    const end = Math.min(DAY_END_HOUR * 60, toMinutes(start) + duration);
    onChange({ start, end: fromMinutes(Math.max(end, toMinutes(start) + SLOT_MINUTES)) });
  };

  return (
    <section>
      <div className="relative isolate">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Photo photo={PHOTOS.hero} sizes="100vw" eager className="size-full" />
        <div className="absolute inset-0 bg-linear-to-b from-ink-950/70 via-ink-950/40 to-ink-950/80" aria-hidden />
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-14 pb-28 sm:px-6 sm:pt-20 lg:px-8 lg:pt-28 lg:pb-36">
        <p className="text-xs font-semibold tracking-[0.3em] text-gold-200 uppercase">Krabi · Bangkok · Thailand</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] font-medium tracking-tight text-white sm:text-5xl lg:text-6xl">
          Stay slow. <span className="text-gold-300 italic">Feel sabai.</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">
          Villas, suites and spa experiences by the Andaman Sea. Check live availability and reserve in a minute.
        </p>

        <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-white">
          {stats.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs text-white/70">{label}</dt>
              <dd className="font-display text-2xl">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      </div>

      {/* Search card, overlapping the bottom of the hero */}
      <div className="relative z-10 mx-auto -mt-20 max-w-7xl px-4 sm:px-6 lg:-mt-24 lg:px-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="rounded-3xl bg-white p-2 shadow-lift ring-1 ring-sand-200/70"
          aria-label="Check availability"
        >
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto] lg:items-center">
            <SearchField icon={CalendarDays} label="Date" htmlFor="hs-date" className="sm:col-span-2 lg:col-span-1">
              <input
                id="hs-date"
                type="date"
                value={value.date}
                min={today}
                max={addDays(today, MAX_DAYS_AHEAD)}
                onChange={(e) => onChange({ date: e.target.value })}
                className={control}
              />
            </SearchField>
            <SearchField icon={Clock} label="From" htmlFor="hs-start">
              <select id="hs-start" value={value.start} onChange={(e) => changeStart(e.target.value)} className={control}>
                {startOptions.map((t) => (
                  <option key={t} value={t}>
                    {formatTime(t)}
                  </option>
                ))}
              </select>
            </SearchField>
            <SearchField icon={Clock} label="Until" htmlFor="hs-end">
              <select id="hs-end" value={value.end} onChange={(e) => onChange({ end: e.target.value })} className={control}>
                {endOptions.map((t) => (
                  <option key={t} value={t}>
                    {formatTime(t)}
                  </option>
                ))}
              </select>
            </SearchField>
            <SearchField icon={Users} label="Guests" htmlFor="hs-guests" className="sm:col-span-2 lg:col-span-1">
              <select
                id="hs-guests"
                value={value.guests}
                onChange={(e) => onChange({ guests: Number(e.target.value) })}
                className={control}
              >
                {GUEST_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g} {g === 1 ? 'guest' : 'guests'}
                  </option>
                ))}
              </select>
            </SearchField>
            <button
              type="submit"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gold-400 px-7 text-[15px] font-semibold text-ink-950 transition hover:bg-gold-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900 sm:col-span-2 lg:col-span-1"
            >
              <Search className="size-4.5" aria-hidden />
              Check availability
            </button>
          </div>
        </form>
        {error && (
          <p className="mt-3 px-2 text-sm font-medium text-rose-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
