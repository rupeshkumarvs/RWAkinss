import { motion, AnimatePresence } from 'motion/react';

const EVENT_STYLES = {
  split_created: {
    icon: 'add_circle',
    color: 'text-primary',
    bg: 'bg-primary/10',
    label: 'Split Created',
  },
  participant_added: {
    icon: 'person_add',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    label: 'Participant Added',
  },
  payment_marked: {
    icon: 'check_circle',
    color: 'text-tertiary',
    bg: 'bg-tertiary/10',
    label: 'Payment Confirmed',
  },
  unknown: {
    icon: 'receipt_long',
    color: 'text-outline',
    bg: 'bg-surface-container-high',
    label: 'Contract Event',
  },
};

/**
 * Real-time event feed component.
 * Displays contract events with animated entry, type-specific icons, and timestamps.
 */
export default function SplitEventFeed({ events, loading }) {
  if (loading) {
    return (
      <div className="bg-surface-container-low rounded-xl p-6 inner-stroke">
        <h3 className="font-headline text-sm uppercase tracking-widest text-on-surface mb-4">
          Live Events
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="w-8 h-8 bg-surface-container-high rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-surface-container-high rounded w-3/4" />
                <div className="h-2 bg-surface-container-high rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low rounded-xl p-6 inner-stroke">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline text-sm uppercase tracking-widest text-on-surface">
          Live Events
        </h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_6px_rgba(78,222,162,0.6)]" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-tertiary">
            Live
          </span>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-3xl text-outline mb-2 block">
            hourglass_empty
          </span>
          <p className="text-sm text-outline-variant">
            No events yet. They'll appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="popLayout">
            {events.slice(0, 20).map((event, i) => {
              const style = EVENT_STYLES[event.eventType] || EVENT_STYLES.unknown;

              return (
                <motion.div
                  key={event.id || i}
                  layout
                  initial={{ opacity: 0, y: -12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-container/50 transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0`}>
                    <span className={`material-symbols-outlined text-sm ${style.color}`}>
                      {style.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-headline font-bold text-on-surface">
                      {event.displayName || style.label}
                    </p>
                    <p className="text-[10px] text-outline-variant truncate mt-0.5">
                      {event.value ? formatEventValue(event.value) : `Ledger ${event.ledger}`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-outline">
                      {event.timestamp ? formatTimestamp(event.timestamp) : ''}
                    </p>
                    {event.ledger && (
                      <p className="text-[9px] text-outline-variant font-mono">
                        L#{event.ledger}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function formatTimestamp(ts) {
  try {
    const date = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  } catch {
    return '';
  }
}

function formatEventValue(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map(v => (typeof v === 'string' ? v : JSON.stringify(v))).join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value).slice(0, 80);
  }
  return String(value);
}
