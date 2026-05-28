'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ClimateProjectionChartProps {
  yearsInFuture: number;
  trajectory: number; // 1=cleaner, 2=current, 3=extreme
}

function generateProjectionData(yearsInFuture: number) {
  const currentYear = new Date().getFullYear();
  const dataPoints: {
    year: number;
    cleaner: number;
    current: number;
    extreme: number;
  }[] = [];

  // Generate data points at intervals
  const steps = Math.min(yearsInFuture, 10);
  const interval = yearsInFuture / steps;

  for (let i = 0; i <= steps; i++) {
    const yearOffset = Math.round(i * interval);
    const t = yearOffset / yearsInFuture; // normalized 0-1

    dataPoints.push({
      year: currentYear + yearOffset,
      // Cleaner future: slight rise then plateau/decline
      cleaner: parseFloat((0.8 * t - 0.3 * t * t).toFixed(2)),
      // Current path: steady rise
      current: parseFloat((1.5 * t + 0.5 * t * t).toFixed(2)),
      // Extreme: accelerating rise
      extreme: parseFloat((1.8 * t + 1.8 * t * t).toFixed(2)),
    });
  }

  return dataPoints;
}

export function ClimateProjectionChart({
  yearsInFuture,
  trajectory,
}: ClimateProjectionChartProps) {
  const data = generateProjectionData(yearsInFuture);

  const activeColor =
    trajectory === 1
      ? '#22c55e'
      : trajectory === 3
        ? '#ef4444'
        : '#eab308';

  return (
    <div className="w-full glass-panel rounded-2xl p-5 md:p-6 animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="p-2 rounded-lg text-white text-sm"
            style={{ backgroundColor: activeColor + '33' }}
          >
            📈
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Temperature Change Trajectory
            </h4>
            <p className="text-xs text-[var(--color-text-muted)]">
              Projected °C change from today across three scenarios
            </p>
          </div>
        </div>
        <div className="w-full h-[220px] md:h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
            >
              <defs>
                <linearGradient id="gradCleaner" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradExtreme" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
              />
              <XAxis
                dataKey="year"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
                unit="°C"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 41, 0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(12px)',
                  color: '#e2e8f0',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                formatter={(value: any, name: any) => [
                  `+${value}°C`,
                  name === 'cleaner'
                    ? '🌱 Cleaner Future'
                    : name === 'current'
                      ? '⚡ Current Path'
                      : '🔥 Extreme Reality',
                ]}
              />
              <Legend
                formatter={(value: string) =>
                  value === 'cleaner'
                    ? '🌱 Cleaner'
                    : value === 'current'
                      ? '⚡ Current'
                      : '🔥 Extreme'
                }
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
              <Area
                type="monotone"
                dataKey="cleaner"
                stroke="#22c55e"
                strokeWidth={trajectory === 1 ? 3 : 1.5}
                fill="url(#gradCleaner)"
                fillOpacity={trajectory === 1 ? 1 : 0.3}
                strokeOpacity={trajectory === 1 ? 1 : 0.4}
                dot={false}
                activeDot={trajectory === 1 ? { r: 5, fill: '#22c55e' } : false}
              />
              <Area
                type="monotone"
                dataKey="current"
                stroke="#eab308"
                strokeWidth={trajectory === 2 ? 3 : 1.5}
                fill="url(#gradCurrent)"
                fillOpacity={trajectory === 2 ? 1 : 0.3}
                strokeOpacity={trajectory === 2 ? 1 : 0.4}
                dot={false}
                activeDot={trajectory === 2 ? { r: 5, fill: '#eab308' } : false}
              />
              <Area
                type="monotone"
                dataKey="extreme"
                stroke="#ef4444"
                strokeWidth={trajectory === 3 ? 3 : 1.5}
                fill="url(#gradExtreme)"
                fillOpacity={trajectory === 3 ? 1 : 0.3}
                strokeOpacity={trajectory === 3 ? 1 : 0.4}
                dot={false}
                activeDot={trajectory === 3 ? { r: 5, fill: '#ef4444' } : false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
