export const inputClass =
  'block h-12 w-full rounded-xl border bg-white px-4 text-[15px] text-ink-950 shadow-xs transition placeholder:text-sand-400 focus:outline-none focus:ring-4 disabled:bg-sand-50 disabled:text-sand-400';

export const inputTone = (hasError) =>
  hasError
    ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
    : 'border-sand-200 hover:border-sand-300 focus:border-ink-500 focus:ring-ink-100';

/** Label + control + hint/error, with ids wired for accessibility. */
export default function Field({ id, label, optional, hint, error, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between text-sm font-semibold text-ink-900">
        {label}
        {optional && <span className="text-xs font-medium text-sand-400">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-xs font-medium text-rose-600" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-2 text-xs text-sand-500">{hint}</p>
      )}
    </div>
  );
}
