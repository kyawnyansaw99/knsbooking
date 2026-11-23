const STYLES = {
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  pending: 'bg-gold-50 text-gold-700 ring-gold-500/30',
  cancelled: 'bg-sand-100 text-sand-600 ring-sand-400/30',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  free: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  busy: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  held: 'bg-gold-50 text-gold-700 ring-gold-500/30',
};

// Solid, high-contrast variants for badges sitting on top of photos.
const ON_IMAGE = {
  free: 'bg-white/95 text-emerald-700',
  busy: 'bg-white/95 text-rose-700',
  held: 'bg-white/95 text-gold-700',
};

const LABELS = {
  approved: 'Confirmed',
  rejected: 'Declined',
  free: 'Available',
  busy: 'Occupied',
  held: 'On hold',
};

export default function StatusBadge({ status, onImage = false, className = '' }) {
  const label = LABELS[status] ?? status.charAt(0).toUpperCase() + status.slice(1);
  const tone = onImage
    ? `${ON_IMAGE[status] ?? 'bg-white/95 text-sand-700'} shadow-sm backdrop-blur`
    : `${STYLES[status] ?? STYLES.cancelled} ring-1 ring-inset`;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone} ${className}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}
