import { useState } from 'react';
import { Ban, Check, X } from 'lucide-react';
import { allowedActions } from '../../lib/bookings.js';

const CONFIRM_COPY = {
  decline: { ask: 'Decline request?', yes: 'Decline' },
  cancel: { ask: 'Cancel reservation?', yes: 'Cancel it' },
};

const btn =
  'inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900';

/**
 * Approve / Decline / Cancel for one booking. Destructive actions ask for an
 * inline confirmation first. `onAction(action, booking)` performs the change.
 */
export default function BookingActions({ booking, now, onAction, className = '' }) {
  const [confirming, setConfirming] = useState(null);
  const actions = allowedActions(booking, now);

  if (!actions.length) return <span className={`text-xs text-sand-400 ${className}`}>No actions</span>;

  if (confirming) {
    const copy = CONFIRM_COPY[confirming];
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`} role="group" aria-label={copy.ask}>
        <span className="text-xs font-semibold text-rose-700">{copy.ask}</span>
        <button
          type="button"
          onClick={() => {
            onAction(confirming, booking);
            setConfirming(null);
          }}
          className={`${btn} bg-rose-600 text-white hover:bg-rose-500`}
        >
          {copy.yes}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(null)}
          className={`${btn} border border-sand-200 bg-white text-ink-900 hover:border-sand-300`}
        >
          Keep
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {actions.includes('approve') && (
        <button
          type="button"
          onClick={() => onAction('approve', booking)}
          className={`${btn} bg-ink-900 text-white hover:bg-ink-800`}
        >
          <Check className="size-3.5 text-gold-300" aria-hidden /> Approve
        </button>
      )}
      {actions.includes('decline') && (
        <button
          type="button"
          onClick={() => setConfirming('decline')}
          className={`${btn} border border-sand-200 bg-white text-ink-900 hover:border-rose-300 hover:text-rose-700`}
        >
          <X className="size-3.5" aria-hidden /> Decline
        </button>
      )}
      {actions.includes('cancel') && (
        <button
          type="button"
          onClick={() => setConfirming('cancel')}
          className={`${btn} border border-sand-200 bg-white text-ink-900 hover:border-rose-300 hover:text-rose-700`}
        >
          <Ban className="size-3.5" aria-hidden /> Cancel
        </button>
      )}
    </div>
  );
}
