import { AlertTriangle, BedDouble, CheckCircle2, Clock, Maximize2, Star, Users } from 'lucide-react';
import DaySchedule from './DaySchedule.jsx';
import Photo from '../ui/Photo.jsx';
import { formatDuration, formatRange, relativeDay, toMinutes, todayISO } from '../../lib/time.js';

/** Photo + key facts for the selected room or experience. */
function ResourcePreview({ resource, type }) {
  const [main, detail] = type === 'room' ? resource.photos : [resource.photo];
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-sand-200/70">
      <div className="relative aspect-[16/10]">
        <Photo photo={main} sizes="(min-width: 1024px) 420px, 100vw" className="size-full" />
        <div className="absolute inset-0 bg-linear-to-t from-ink-950/75 via-transparent to-transparent" aria-hidden />
        {detail && (
          <Photo
            photo={detail}
            sizes="112px"
            className="absolute top-3 right-3 h-16 w-24 rounded-xl ring-2 ring-white/90"
          />
        )}
        <div className="absolute inset-x-4 bottom-4 text-white">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-gold-200 uppercase">
            {type === 'room' ? resource.view : resource.category}
          </p>
          <p className="mt-1 font-display text-2xl leading-tight">{resource.name}</p>
        </div>
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-2 px-5 py-4 text-sm text-sand-700">
        {type === 'room' ? (
          <>
            <li className="inline-flex items-center gap-1.5">
              <BedDouble className="size-4 text-sand-400" aria-hidden /> {resource.bed}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Maximize2 className="size-3.5 text-sand-400" aria-hidden /> {resource.size} m²
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Users className="size-4 text-sand-400" aria-hidden /> Up to {resource.capacity}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Star className="size-4 fill-gold-400 text-gold-400" aria-hidden /> {resource.rating.toFixed(1)}
            </li>
          </>
        ) : (
          <li className="inline-flex items-center gap-1.5">
            <Users className="size-4 text-sand-400" aria-hidden /> {resource.quantity} can be booked at the same time
          </li>
        )}
      </ul>
    </div>
  );
}

function StatusMessage({ resource, form, errors, conflicts, unitsFree, resourceName }) {
  if (!resource) {
    return <p className="text-sm text-sand-500">Choose a room or experience to see availability.</p>;
  }

  if (errors.time) {
    return (
      <div className="flex gap-3 rounded-2xl bg-sand-50 p-4 text-sm text-sand-700 ring-1 ring-sand-200/70">
        <Clock className="mt-0.5 size-4 shrink-0" aria-hidden />
        {errors.time}
      </div>
    );
  }

  if (errors.conflict) {
    return (
      <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-800 ring-1 ring-rose-200" role="alert">
        <p className="flex gap-3 font-semibold">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {errors.conflict}
        </p>
        <ul className="mt-2 space-y-1 pl-7 text-xs">
          {conflicts.map((b) => (
            <li key={b.id}>
              <span className="font-semibold">{formatRange(b.start, b.end)}</span> · {b.title} ({resourceName(b)},{' '}
              {b.status})
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const duration = toMinutes(form.end) - toMinutes(form.start);
  return (
    <div className="flex gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>
        <span className="font-semibold">
          {form.resourceType === 'room' ? `${resource.name} is available` : `${unitsFree} of ${resource.quantity} available`}
        </span>{' '}
        {relativeDay(form.date)}, {formatRange(form.start, form.end)} ({formatDuration(duration)}).
      </p>
    </div>
  );
}

function ChipButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center rounded-full border border-sand-200 bg-white px-3.5 py-2 text-sm font-semibold text-ink-900 transition hover:border-gold-400 hover:bg-gold-50"
    >
      {children}
    </button>
  );
}

export default function AvailabilityPanel({
  resource,
  form,
  errors,
  conflicts,
  unitsFree,
  dayBookings,
  slots,
  rooms,
  resourceName,
  onPickSlot,
  onPickRoom,
}) {
  const candidate = !errors.time && form.start && form.end ? form : null;
  const conflictIds = new Set(conflicts.map((b) => b.id));
  const blocked = Boolean(errors.conflict);

  return (
    <div className="space-y-4">
      {resource && <ResourcePreview resource={resource} type={form.resourceType} />}

      <section className="space-y-5 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand-200/70 sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl font-medium">Availability</h2>
          {form.date && <p className="text-sm text-sand-500">{relativeDay(form.date, todayISO())}</p>}
        </div>

        <StatusMessage
          resource={resource}
          form={form}
          errors={errors}
          conflicts={conflicts}
          unitsFree={unitsFree}
          resourceName={resourceName}
        />

        {resource && form.date && (
          <DaySchedule
            bookings={dayBookings}
            candidate={candidate}
            conflictIds={conflictIds}
            hasConflict={blocked}
            showNow={form.date === todayISO()}
          />
        )}

        {blocked && (slots.length > 0 || rooms.length > 0) && (
          <div className="space-y-4 border-t border-sand-100 pt-5">
            {slots.length > 0 && (
              <div>
                <p className="mb-2.5 text-[11px] font-semibold tracking-[0.15em] text-sand-500 uppercase">
                  Free times, same length
                </p>
                <div className="flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <ChipButton key={s.start} onClick={() => onPickSlot(s)}>
                      {formatRange(s.start, s.end)}
                    </ChipButton>
                  ))}
                </div>
              </div>
            )}
            {rooms.length > 0 && (
              <div>
                <p className="mb-2.5 text-[11px] font-semibold tracking-[0.15em] text-sand-500 uppercase">
                  Other rooms free at this time
                </p>
                <div className="flex flex-wrap gap-2">
                  {rooms.map((r) => (
                    <ChipButton key={r.id} onClick={() => onPickRoom(r)}>
                      {r.name}
                      <span className="ml-2 inline-flex items-center gap-0.5 text-xs font-medium text-sand-500">
                        <Users className="size-3" aria-hidden />
                        {r.capacity}
                      </span>
                    </ChipButton>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
