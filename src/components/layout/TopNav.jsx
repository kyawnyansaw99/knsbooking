import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { CalendarPlus, Menu, Search, ShieldCheck, X } from 'lucide-react';
import { useBookings } from '../../context/BookingContext.jsx';
import Logo from './Logo.jsx';

export default function TopNav() {
  const { bookings } = useBookings();
  const pending = bookings.filter((b) => b.status === 'pending').length;
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  const items = [
    { to: '/', label: 'Find Rooms', icon: Search, end: true },
    { to: '/book', label: 'Reserve', icon: CalendarPlus },
    { to: '/admin', label: 'Admin', icon: ShieldCheck, badge: pending },
  ];

  const desktopLink = ({ isActive }) =>
    `relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-ink-900 text-white' : 'text-sand-700 hover:bg-sand-100 hover:text-ink-900'
    }`;

  const mobileLink = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
      isActive ? 'bg-ink-900 text-white' : 'text-sand-800 hover:bg-sand-100'
    }`;

  const Badge = ({ n }) =>
    n > 0 && (
      <span className="grid min-w-5 place-items-center rounded-full bg-gold-400 px-1.5 text-[11px] leading-5 font-bold text-ink-950">
        {n}
      </span>
    );

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {items.map(({ to, label, end, badge }) => (
            <NavLink key={to} to={to} end={end} className={desktopLink}>
              {label}
              <Badge n={badge} />
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/book"
            className="hidden items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-ink-950 shadow-sm transition hover:bg-gold-300 sm:inline-flex"
          >
            Book a stay
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid size-10 place-items-center rounded-full text-ink-900 hover:bg-sand-100 md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-sand-200/70 bg-white px-4 py-3 md:hidden" aria-label="Main">
          <div className="space-y-1">
            {items.map(({ to, label, icon: Icon, end, badge }) => (
              <NavLink key={to} to={to} end={end} className={mobileLink}>
                <Icon className="size-4" aria-hidden />
                <span className="flex-1">{label}</span>
                <Badge n={badge} />
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
