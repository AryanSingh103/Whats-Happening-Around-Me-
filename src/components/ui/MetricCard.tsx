'use client';

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  colorClass?: string;
  delay?: number;
}

export function MetricCard({
  label,
  value,
  unit = '',
  colorClass = 'text-white',
  delay = 0,
}: MetricCardProps) {
  return (
    <div
      className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 rounded-xl text-center hover:border-[var(--color-accent)]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-accent)]/5 hover:-translate-y-0.5 group animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-sm text-[var(--color-text-muted)] mb-1 group-hover:text-[var(--color-text-secondary)] transition-colors">
        {label}
      </p>
      <p className={`text-2xl font-bold ${colorClass}`}>
        {value}
        {unit && <span className="text-base font-medium text-[var(--color-text-secondary)]">{unit}</span>}
      </p>
    </div>
  );
}
