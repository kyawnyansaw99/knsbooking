const TONES = {
  ink: 'bg-ink-50 text-ink-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  gold: 'bg-gold-50 text-gold-600',
  sand: 'bg-sand-100 text-sand-700',
};

export default function StatCard({ icon: Icon, label, value, hint, tone = 'ink' }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-sand-200/70">
      <div className="flex items-center gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${TONES[tone]}`}>
          <Icon className="size-5" aria-hidden />
        </span>
        <p className="text-sm font-medium text-sand-600">{label}</p>
      </div>
      <p className="mt-4 font-display text-4xl font-medium tracking-tight text-ink-950 tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-sand-500">{hint}</p>}
    </div>
  );
}
