import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchContractEvents } from '../utils/contractClient';
import { CONTRACT_ID } from '../utils/stellar';

/**
 * Hook for real-time contract event polling via Soroban RPC.
 *
 * Polls every `interval` ms for new events from the split bill contract.
 * Supports cursor-based pagination to avoid duplicates.
 *
 * Returns:
 *  - events: all events fetched so far (newest first)
 *  - latestEvent: the most recent event (for toast notifications)
 *  - loading: initial load state
 *  - error: polling error
 *  - refresh(): manual refresh trigger
 */
export function useEvents(interval = 6000) {
  const [events, setEvents] = useState([]);
  const [latestEvent, setLatestEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cursorRef = useRef(null);
  const intervalRef = useRef(null);
  const isFirstFetch = useRef(true);

  const poll = useCallback(async () => {
    if (!CONTRACT_ID) return;

    if (isFirstFetch.current) {
      setLoading(true);
    }

    try {
      const { events: newEvents, cursor } = await fetchContractEvents(
        cursorRef.current,
        20
      );

      if (newEvents.length > 0) {
        cursorRef.current = cursor;

        setEvents(prev => {
          // Deduplicate by event id
          const existingIds = new Set(prev.map(e => e.id));
          const unique = newEvents.filter(e => !existingIds.has(e.id));

          if (unique.length > 0) {
            // Set the latest event for notifications
            setLatestEvent(unique[unique.length - 1]);
          }

          return [...unique.reverse(), ...prev]; // Newest first
        });
      }

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      if (isFirstFetch.current) {
        setLoading(false);
        isFirstFetch.current = false;
      }
    }
  }, []);

  // Start polling when contract is configured
  useEffect(() => {
    if (!CONTRACT_ID) return;

    // Initial fetch
    poll();

    // Set up interval
    intervalRef.current = setInterval(poll, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [poll, interval]);

  // Manual refresh
  const refresh = useCallback(() => {
    poll();
  }, [poll]);

  // Parse event topics into human-readable format
  const parsedEvents = events.map(event => {
    const topics = event.topic || [];
    let eventType = 'unknown';
    let displayName = 'Contract Event';
    let icon = 'receipt_long';

    // Parse SPLIT event topics
    if (topics.length >= 2) {
      const action = typeof topics[1] === 'string' ? topics[1] : String(topics[1]);

      if (action === 'created' || action.includes('created')) {
        eventType = 'split_created';
        displayName = 'Split Created';
        icon = 'add_circle';
      } else if (action === 'p_added' || action.includes('added')) {
        eventType = 'participant_added';
        displayName = 'Participant Added';
        icon = 'person_add';
      } else if (action === 'paid' || action.includes('paid')) {
        eventType = 'payment_marked';
        displayName = 'Payment Marked';
        icon = 'check_circle';
      }
    }

    return {
      ...event,
      eventType,
      displayName,
      icon,
    };
  });

  return {
    events: parsedEvents,
    latestEvent,
    loading,
    error,
    refresh,
    eventCount: events.length,
  };
}
