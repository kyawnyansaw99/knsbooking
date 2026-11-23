import { RotateCcw } from 'lucide-react';
import { useBookings } from '../../context/BookingContext.jsx';
import Logo from './Logo.jsx';

export default function Footer() {
  const { resetDemoData } = useBookings();
  return (
    <footer className="mt-20 bg-ink-950 text-ink-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-xs text-sm leading-relaxed text-ink-200/80">
            Rooms, villas and experiences, arranged with the warmth of Thai hospitality.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-gold-200">Front desk</p>
          <p className="mt-3 text-ink-200/80">Open daily · 08:00 – 19:00</p>
          <p className="text-ink-200/80">Reservations are confirmed by our team.</p>
        </div>
        <div className="flex flex-col items-start gap-3 text-sm md:items-end">
          <button
            type="button"
            onClick={resetDemoData}
            className="inline-flex items-center gap-2 rounded-full border border-ink-700 px-4 py-2 text-ink-100 transition hover:border-gold-300 hover:text-gold-200"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Reset demo data
          </button>
          <p className="text-xs text-ink-300/70">
            Photography via{' '}
            <a href="https://unsplash.com" target="_blank" rel="noreferrer" className="underline hover:text-gold-200">
              Unsplash
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
