'use client';

import { useEffect, useState } from 'react';
import { API_BASE } from '@/lib/constants';

type Status = 'checking' | 'live' | 'slow' | 'down';

export function BackendStatus() {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    const start = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    fetch(`${API_BASE}/health`, { signal: controller.signal })
      .then((r) => {
        clearTimeout(timeoutId);
        if (r.ok) {
          const ms = Date.now() - start;
          setStatus(ms > 8000 ? 'slow' : 'live');
        } else {
          setStatus('down');
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
        setStatus('down');
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const config = {
    checking: { color: '#888', label: 'Checking API...', dot: '#888' },
    live: { color: '#10B981', label: 'API Live', dot: '#10B981' },
    slow: { color: '#F59E0B', label: 'API Starting (may take 30s)', dot: '#F59E0B' },
    down: { color: '#EF4444', label: 'API Offline', dot: '#EF4444' },
  }[status];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        color: config.color,
        fontFamily: 'var(--font-mono, ui-monospace, monospace)',
      }}
      title={config.label}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: config.dot,
          boxShadow: status === 'live' ? `0 0 8px ${config.dot}` : 'none',
          animation: status === 'live' ? 'pulse 2s ease-in-out infinite' : 'none',
        }}
      />
      {config.label}
    </span>
  );
}
