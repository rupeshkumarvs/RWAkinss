'use client';

import React, { useState, useEffect, useRef } from 'react';

const STATS = [
  { value: 25000, suffix: '+', label: 'TPS on QIE' },
  { value: 4, suffix: '', label: 'Smart Contracts' },
  { value: 0, suffix: '', label: 'Mock Data Used' },
  { value: 1000, suffix: '', label: 'Max Credit Score' },
];

function useCountUp(target: number, duration: number = 1400, active: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;

    const start = performance.now();
    let rafId: number;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.round(target * eased));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, [active, target, duration]);

  return count;
}

export const StatsBar: React.FC = () => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative py-12 md:py-16 bg-[#0A0A0A] border-t border-b border-[rgba(255,255,255,0.1)]"
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(245,197,24,0.05), transparent)',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STATS.map((stat, idx) => {
            const count = useCountUp(stat.value, 1400, inView);
            return (
              <div key={idx} className="relative text-center px-4 group">
                {/* Divider for desktop */}
                {idx > 0 && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-12 bg-gradient-to-b from-transparent via-[rgba(245,197,24,0.2)] to-transparent hidden md:block" />
                )}
                <div className="stat-number mb-3">
                  {count.toLocaleString()}
                  {stat.suffix}
                </div>
                <div className="stat-label">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
