import { useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BedDouble, Check, ChevronRight, Sparkles, Users } from 'lucide-react';
import { useBookings } from '../context/BookingContext.jsx';
import { useNow } from '../hooks/useNow.js';
import {
  MAX_DAYS_AHEAD,
  alternativeRooms,
  bookingsFor,
  defaultSlot,
  findResource,
  freeUnits,
  suggestSlots,
  validateBooking,
} from '../lib/bookings.js';
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
} from '../lib/time.js';
import PageHeader from '../components/layout/PageHeader.jsx';
import Field, { inputClass, inputTone } from '../components/ui/Field.jsx';
import Photo from '../components/ui/Photo.jsx';
import AvailabilityPanel from '../components/booking/AvailabilityPanel.jsx';
import BookingSuccess from '../components/booking/BookingSuccess.jsx';

const DAY_START = DAY_START_HOUR * 60;
const DAY_END = DAY_END_HOUR * 60;
const REQUESTER_KEY = 'roomdesk.requester';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

// Fields whose errors are shown as soon as they occur; the rest wait for submit.
const LIVE_FIELDS = ['time', 'attendees', 'conflict'];

/** Use date/start/end from the URL (hero search) when they're well-formed, else a sensible default. */
function slotFromParams(params) {
  const date = params.get('date') ?? '';
  const start = params.get('start') ?? '';
  const end = params.get('end') ?? '';
  const onGrid = (t) => TIME_RE.test(t) && toMinutes(t) % SLOT_MINUTES === 0;
  if (
    DATE_RE.test(date) &&
    onGrid(start) &&
    onGrid(end) &&
    toMinutes(start) >= DAY_START &&
    toMinutes(end) <= DAY_END &&
    toMinutes(end) > toMinutes(start)
  ) {
    return { date, start, end };
  }
  return defaultSlot(new Date());
}

function guestsFromParams(params) {
  const n = Number.parseInt(params.get('guests') ?? '', 10);
  return n >= 1 && n <= 99 ? String(n) : '';
}

function readRequester() {
  try {
    return localStorage.getItem(REQUESTER_KEY) ?? '';
  } catch {
    return '';
  }
}

function rememberRequester(name) {
  try {
    localStorage.setItem(REQUESTER_KEY, name);
  } catch {
    /* non-essential */
  }
}

function Section({ step, title, children }) {
  return (
    <fieldset className="border-b border-sand-100 px-5 py-7 last:border-b-0 sm:px-8">
      <legend className="contents">
        <span className="mb-5 flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full bg-ink-900 font-display text-sm text-gold-200">
            {step}
          </span>
          <span className="font-display text-xl font-medium text-ink-950">{title}</span>
        </span>
      </legend>
      {children}
    </fieldset>
  );
}

function TypeToggle({ value, onChange }) {
  const options = [
    { value: 'room', label: 'Room or villa', icon: BedDouble },
    { value: 'equipment', label: 'Experience', icon: Sparkles },
  ];
  return (
    <div className="grid grid-cols-2 gap-1 rounded-full bg-sand-100 p-1" role="group" aria-label="Reservation type">
      {options.map(({ value: v, label, icon: Icon }) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`inline-flex items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold transition ${
            value === v ? 'bg-white text-ink-950 shadow-soft' : 'text-sand-600 hover:text-ink-900'
          }`}
        >
          <Icon className="size-4" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}

/** Photo radio cards for choosing the room / experience. */
function ResourcePicker({ type, list, value, onChange, error }) {
  return (
    <div>
      <div
        role="radiogroup"
        aria-label={type === 'room' ? 'Room' : 'Experience'}
        aria-invalid={Boolean(error)}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {list.map((r) => {
          const selected = r.id === value;
          const photo = type === 'room' ? r.photos[0] : r.photo;
          return (
            <label
              key={r.id}
              className={`group relative flex cursor-pointer items-center gap-3 rounded-2xl border bg-white p-2.5 pr-4 transition focus-within:ring-4 focus-within:ring-ink-100 ${
                selected ? 'border-ink-800 ring-1 ring-ink-800' : 'border-sand-200 hover:border-sand-300'
              }`}
            >
              <input
                type="radio"
                name="resource"
                value={r.id}
                checked={selected}
                onChange={() => onChange(r.id)}
                className="sr-only"
              />
              <Photo photo={photo} sizes="80px" className="h-16 w-20 shrink-0 rounded-xl" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink-950">{r.name}</span>
                <span className="mt-0.5 flex items-center gap-1 text-xs text-sand-500">
                  {type === 'room' ? (
                    <>
                      <Users className="size-3" aria-hidden /> Up to {r.capacity} · {r.size} m²
                    </>
                  ) : (
                    `${r.category} · ${r.quantity} at a time`
                  )}
                </span>
              </span>
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full border transition ${
                  selected ? 'border-ink-900 bg-ink-900 text-gold-200' : 'border-sand-300 text-transparent'
                }`}
                aria-hidden
              >
                <Check className="size-3" strokeWidth={3} />
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p className="mt-2 text-xs font-medium text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function BookingForm() {
  const { rooms, equipment, bookings, createBooking } = useBookings();
  const [params] = useSearchParams();
  const now = useNow();
  const catalog = useMemo(() => ({ rooms, equipment }), [rooms, equipment]);

  const blankForm = (type, id, slot = defaultSlot(new Date()), attendees = '') => {
    const list = type === 'room' ? rooms : equipment;
    return {
      resourceType: type,
      resourceId: list.some((r) => r.id === id) ? id : list[0].id,
      title: '',
      requester: readRequester(),
      attendees: type === 'room' ? attendees : '',
      notes: '',
      ...slot,
    };
  };

  const [form, setForm] = useState(() =>
    blankForm(
      params.get('type') === 'equipment' ? 'equipment' : 'room',
      params.get('id'),
      slotFromParams(params),
      guestsFromParams(params),
    ),
  );
  const [submitted, setSubmitted] = useState(false);
  const [created, setCreated] = useState(null);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const candidate = useMemo(
    () => ({ ...form, attendees: form.attendees ? Number(form.attendees) : null }),
    [form],
  );

  const resource = findResource(form.resourceType, form.resourceId, catalog);
  const resourceName = (b) => findResource(b.resourceType, b.resourceId, catalog)?.name ?? 'Unknown';

  // Recomputed on every change (and every 30s via `now`) so feedback stays live.
  const { errors, conflicts } = validateBooking(candidate, bookings, catalog, now);
  const dayBookings = form.date ? bookingsFor(form.resourceType, form.resourceId, form.date, bookings) : [];
  const unitsFree = !errors.time && resource ? freeUnits(candidate, bookings, catalog) : 0;
  const slots = errors.conflict ? suggestSlots(candidate, bookings, catalog, now) : [];
  const altRooms = errors.conflict ? alternativeRooms(candidate, bookings, catalog) : [];

  const shown = (field) => (submitted || LIVE_FIELDS.includes(field) ? errors[field] : undefined);

  const changeType = (type) => {
    if (type === form.resourceType) return;
    set({
      resourceType: type,
      resourceId: (type === 'room' ? rooms : equipment)[0].id,
      attendees: type === 'room' ? form.attendees : '',
    });
  };

  // Moving the start time keeps the reservation length, clamped to opening hours.
  const changeStart = (start) => {
    const duration = Math.max(SLOT_MINUTES, toMinutes(form.end) - toMinutes(form.start));
    const end = Math.min(DAY_END, toMinutes(start) + duration);
    set({ start, end: fromMinutes(Math.max(end, toMinutes(start) + SLOT_MINUTES)) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const result = createBooking({
      ...candidate,
      title: form.title.trim(),
      requester: form.requester.trim(),
      notes: form.notes.trim(),
    });
    if (result.ok) {
      rememberRequester(result.booking.requester);
      setCreated(result.booking);
      window.scrollTo({ top: 0 });
    }
  };

  if (created) {
    return (
      <BookingSuccess
        booking={created}
        resource={findResource(created.resourceType, created.resourceId, catalog)}
        onBookAnother={() => {
          setForm(blankForm(created.resourceType, created.resourceId));
          setSubmitted(false);
          setCreated(null);
        }}
      />
    );
  }

  const today = todayISO(now);
  const startOptions = timeOptions(DAY_START, DAY_END - SLOT_MINUTES);
  const endOptions = timeOptions(toMinutes(form.start) + SLOT_MINUTES, DAY_END);
  const list = form.resourceType === 'room' ? rooms : equipment;
  const errorCount = submitted ? Object.keys(errors).length : 0;
  const timeTone = inputTone(shown('time') || shown('conflict'));

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-sand-500">
        <Link to="/" className="hover:text-ink-900">
          Find Rooms
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="font-medium text-ink-900">Reserve</span>
      </nav>

      <PageHeader
        eyebrow="Reservations"
        title="Plan your stay"
        description="Your time is held as soon as you submit and confirmed by our front office shortly after."
      />

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <form
          noValidate
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-sand-200/70 lg:col-span-7"
        >
          <Section step={1} title="Choose your space">
            <div className="space-y-4">
              <TypeToggle value={form.resourceType} onChange={changeType} />
              <ResourcePicker
                type={form.resourceType}
                list={list}
                value={form.resourceId}
                onChange={(id) => set({ resourceId: id })}
                error={shown('resourceId')}
              />
            </div>
          </Section>

          <Section step={2} title="Select date & time">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field id="date" label="Date" className="col-span-2">
                <input
                  id="date"
                  type="date"
                  value={form.date}
                  min={today}
                  max={addDays(today, MAX_DAYS_AHEAD)}
                  onChange={(e) => set({ date: e.target.value })}
                  aria-invalid={Boolean(shown('time'))}
                  className={`${inputClass} ${inputTone(shown('time'))}`}
                />
              </Field>
              <Field id="start" label="From">
                <select id="start" value={form.start} onChange={(e) => changeStart(e.target.value)} className={`${inputClass} ${timeTone}`}>
                  {startOptions.map((t) => (
                    <option key={t} value={t}>
                      {formatTime(t)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="end" label="Until">
                <select id="end" value={form.end} onChange={(e) => set({ end: e.target.value })} className={`${inputClass} ${timeTone}`}>
                  {endOptions.map((t) => (
                    <option key={t} value={t}>
                      {formatTime(t)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            {(shown('time') || shown('conflict')) && (
              <p
                className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700"
                role="alert"
              >
                <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden />
                {shown('time') || `${shown('conflict')} Pick one of the suggested times or rooms.`}
              </p>
            )}
          </Section>

          <Section step={3} title="Guest details">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field id="requester" label="Guest name" error={shown('requester')}>
                <input
                  id="requester"
                  value={form.requester}
                  onChange={(e) => set({ requester: e.target.value })}
                  placeholder="e.g. Aye Chan"
                  maxLength={60}
                  autoComplete="name"
                  aria-invalid={Boolean(shown('requester'))}
                  className={`${inputClass} ${inputTone(shown('requester'))}`}
                />
              </Field>
              {form.resourceType === 'room' ? (
                <Field
                  id="attendees"
                  label="Guests"
                  optional
                  error={shown('attendees')}
                  hint={resource ? `This room sleeps up to ${resource.capacity}` : undefined}
                >
                  <input
                    id="attendees"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={99}
                    value={form.attendees}
                    onChange={(e) => set({ attendees: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                    placeholder="2"
                    aria-invalid={Boolean(shown('attendees'))}
                    className={`${inputClass} ${inputTone(shown('attendees'))}`}
                  />
                </Field>
              ) : (
                <div className="hidden sm:block" />
              )}
              <Field id="title" label="Occasion" error={shown('title')} className="sm:col-span-2">
                <input
                  id="title"
                  value={form.title}
                  onChange={(e) => set({ title: e.target.value })}
                  placeholder={form.resourceType === 'room' ? 'e.g. Day-use stay, Anniversary' : 'e.g. Couples massage'}
                  maxLength={80}
                  aria-invalid={Boolean(shown('title'))}
                  className={`${inputClass} ${inputTone(shown('title'))}`}
                />
              </Field>
              <Field id="notes" label="Special requests" optional className="sm:col-span-2">
                <textarea
                  id="notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => set({ notes: e.target.value })}
                  placeholder="Dietary needs, flowers, late arrival…"
                  maxLength={500}
                  className={`${inputClass} ${inputTone(false)} h-auto resize-y py-3`}
                />
              </Field>
            </div>
          </Section>

          <div className="flex flex-col-reverse gap-4 bg-sand-50 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className={`text-sm ${errorCount ? 'font-medium text-rose-600' : 'text-sand-600'}`}>
              {errorCount
                ? `Please fix ${errorCount} ${errorCount === 1 ? 'detail' : 'details'} to continue.`
                : 'No payment needed now. Our front office confirms each request.'}
            </p>
            <button
              type="submit"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900"
            >
              Request reservation
              <ArrowRight className="size-4 text-gold-300 transition group-hover:translate-x-0.5" aria-hidden />
            </button>
          </div>
        </form>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <AvailabilityPanel
              resource={resource}
              form={form}
              errors={errors}
              conflicts={conflicts}
              unitsFree={unitsFree}
              dayBookings={dayBookings}
              slots={slots}
              rooms={altRooms}
              resourceName={resourceName}
              onPickSlot={(s) => set({ start: s.start, end: s.end })}
              onPickRoom={(r) => set({ resourceId: r.id })}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default function BookingPage() {
  // Re-mount the form when the query changes (e.g. clicking "Reserve" on another room while here).
  const { search } = useLocation();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <BookingForm key={search} />
    </div>
  );
}
