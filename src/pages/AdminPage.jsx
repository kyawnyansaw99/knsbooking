import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, CalendarCheck, CalendarPlus, CheckCircle2, Hourglass, Sparkles } from 'lucide-react';
import { useBookings } from '../context/BookingContext.jsx';
import { useNow } from '../hooks/useNow.js';
import {
  compareDateTime,
  equipmentInUse,
  findResource,
  isActive,
  roomStatus,
  upcomingBookings,
} from '../lib/bookings.js';
import { formatDateLong, formatRange, relativeDay, todayISO } from '../lib/time.js';
import PageHeader, { SectionHeading } from '../components/layout/PageHeader.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import ScheduleTimeline from '../components/dashboard/ScheduleTimeline.jsx';
import UpcomingList from '../components/dashboard/UpcomingList.jsx';
import PendingQueue from '../components/admin/PendingQueue.jsx';
import ReservationsTable from '../components/admin/ReservationsTable.jsx';

const DONE_COPY = { approve: 'confirmed', decline: 'declined', cancel: 'cancelled' };

export default function AdminPage() {
  const { rooms, equipment, bookings, approveBooking, rejectBooking, cancelBooking } = useBookings();
  const now = useNow();
  const today = todayISO(now);
  const [notice, setNotice] = useState('');

  const resourceOf = useCallback(
    (b) => findResource(b.resourceType, b.resourceId, { rooms, equipment }),
    [rooms, equipment],
  );

  // Live operational figures (moved here from the public Find Rooms page).
  const { statuses, stats, upcoming, pending } = useMemo(() => {
    const statuses = Object.fromEntries(rooms.map((r) => [r.id, roomStatus(r.id, bookings, now)]));
    const totalUnits = equipment.reduce((n, e) => n + e.quantity, 0);
    const unitsOut = equipment.reduce((n, e) => n + equipmentInUse(e.id, bookings, now), 0);
    const pending = bookings.filter((b) => b.status === 'pending').sort(compareDateTime);
    return {
      statuses,
      upcoming: upcomingBookings(bookings, now),
      pending,
      stats: {
        roomsFree: Object.values(statuses).filter((s) => s.state === 'free').length,
        bookingsToday: bookings.filter((b) => b.date === today && isActive(b)).length,
        pending: pending.length,
        unitsFree: totalUnits - unitsOut,
        totalUnits,
      },
    };
  }, [rooms, equipment, bookings, now, today]);

  const handleAction = useCallback(
    (action, booking) => {
      if (action === 'approve') approveBooking(booking.id);
      if (action === 'decline') rejectBooking(booking.id);
      if (action === 'cancel') cancelBooking(booking.id);
      setNotice(
        `${booking.title} · ${relativeDay(booking.date)}, ${formatRange(booking.start, booking.end)} was ${DONE_COPY[action]}.`,
      );
    },
    [approveBooking, rejectBooking, cancelBooking],
  );

  useEffect(() => {
    if (!notice) return undefined;
    const id = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(id);
  }, [notice]);

  return (
    <div className="mx-auto max-w-7xl space-y-14 px-4 py-8 sm:px-6 lg:space-y-20 lg:px-8 lg:py-12">
      <div className="space-y-8">
        <PageHeader
          eyebrow={formatDateLong(today)}
          title="Reservations admin"
          description="Confirm new requests, manage existing reservations and keep an eye on today’s occupancy."
          actions={
            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ink-800"
            >
              <CalendarPlus className="size-4" aria-hidden />
              New reservation
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={BedDouble} tone="emerald" label="Rooms free now" value={`${stats.roomsFree}/${rooms.length}`} hint="Updates every 30 seconds" />
          <StatCard icon={CalendarCheck} tone="ink" label="Reservations today" value={stats.bookingsToday} hint="Confirmed and pending" />
          <StatCard icon={Hourglass} tone="gold" label="Awaiting confirmation" value={stats.pending} hint={stats.pending ? 'See the queue below' : 'All caught up'} />
          <StatCard icon={Sparkles} tone="sand" label="Experiences open" value={`${stats.unitsFree}/${stats.totalUnits}`} hint="Spa, cabanas, trips & dining" />
        </div>
      </div>

      <section className="space-y-6" aria-labelledby="queue-heading">
        <SectionHeading
          id="queue-heading"
          eyebrow="Needs attention"
          title="Awaiting confirmation"
          description="Pending requests hold their time slot until you approve or decline them."
        />
        <PendingQueue bookings={pending} resourceOf={resourceOf} now={now} onAction={handleAction} />
      </section>

      <section className="space-y-6" aria-labelledby="ops-heading">
        <SectionHeading
          id="ops-heading"
          eyebrow="Today"
          title="Occupancy & arrivals"
          description="Live timeline across all rooms and the next reservations."
        />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="min-w-0 xl:col-span-2">
            <ScheduleTimeline rooms={rooms} statuses={statuses} now={now} />
          </div>
          <UpcomingList bookings={upcoming} resourceOf={resourceOf} now={now} viewAllHref="#log" />
        </div>
      </section>

      <section id="log" className="scroll-mt-24 space-y-6" aria-labelledby="log-heading">
        <SectionHeading
          id="log-heading"
          eyebrow="All reservations"
          title="Reservation log"
          description="Search and filter every reservation. Cancelling or declining frees the time slot."
        />
        <ReservationsTable bookings={bookings} resourceOf={resourceOf} now={now} onAction={handleAction} />
      </section>

      {/* Action feedback */}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-6"
        role="status"
        aria-live="polite"
      >
        {notice && (
          <p className="pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl bg-ink-950 px-4 py-3 text-sm text-white shadow-lift">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold-300" aria-hidden />
            {notice}
          </p>
        )}
      </div>
    </div>
  );
}
