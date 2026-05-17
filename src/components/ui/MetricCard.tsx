'use client';

import { useEffect, useState, useRef } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  colorClass?: string;
  delay?: number;
}

function useAnimatedNumber(target: number, duration: number = 800, delay: number = 0) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    let animationFrameId: number;
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCurrent(target * eased);
        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          setCurrent(target);
        }
      };
      animationFrameId = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration, delay]);

  return current;
}

export function MetricCard({
  label,
  value,
  unit = '',
  colorClass = 'text-white',
  delay = 0,
}: MetricCardProps) {
  // Try to extract a number from the value for animation
  const numericMatch = value.match(/^(-?\d+\.?\d*)/);
  const numericValue = numericMatch ? parseFloat(numericMatch[1]) : null;
  const suffix = numericMatch ? value.slice(numericMatch[0].length) : '';
  const isInteger = numericValue !== null && Number.isInteger(numericValue);

  const animatedNum = useAnimatedNumber(
    numericValue ?? 0,
    800,
    delay + 200
  );

  return (
    <div
      className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 rounded-xl text-center hover:border-[var(--color-accent)]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-accent)]/5 hover:-translate-y-1 group animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-sm text-[var(--color-text-muted)] mb-1 group-hover:text-[var(--color-text-secondary)] transition-colors">
        {label}
      </p>
      <p className={`text-2xl font-bold ${colorClass} transition-all`}>
        {numericValue !== null ? (
          <>
            {isInteger ? Math.round(animatedNum) : animatedNum.toFixed(1)}
            {suffix}
          </>
        ) : (
          value
        )}
        {unit && (
          <span className="text-base font-medium text-[var(--color-text-secondary)]">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
