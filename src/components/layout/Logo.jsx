import { Link } from 'react-router-dom';

export function LogoMark({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#143030" />
      <path d="M16 7c2.6 2.4 3.9 5.1 3.9 8.1S18.6 20.6 16 23c-2.6-2.4-3.9-5-3.9-7.9S13.4 9.4 16 7Z" fill="#cf9f52" />
      <path
        d="M16 23c-3.6-.2-6.5-1.6-8.6-4.4 2.7-.9 5.3-.6 7.6 1M16 23c3.6-.2 6.5-1.6 8.6-4.4-2.7-.9-5.3-.6-7.6 1"
        fill="none"
        stroke="#e8d3a7"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Logo({ light = false }) {
  return (
    <Link
      to="/"
      className="inline-flex shrink-0 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400"
      aria-label="KNSbooking – find rooms"
    >
      <LogoMark className="size-9" />
      <span
        className={`font-display text-xl leading-none font-semibold tracking-tight whitespace-nowrap ${light ? 'text-white' : 'text-ink-900'}`}
      >
        KNSbooking
      </span>
    </Link>
  );
}
