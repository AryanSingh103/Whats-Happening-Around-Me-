'use client';

import { useEnvironmentData } from '@/hooks/useEnvironmentData';
import { MetricCard } from '@/components/ui/MetricCard';
import { LoadingShimmer } from '@/components/ui/LoadingShimmer';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

function getAqiColor(aqi: number): string {
  if (aqi <= 50) return 'text-green-400';
  if (aqi <= 100) return 'text-yellow-400';
  if (aqi <= 150) return 'text-orange-400';
  return 'text-red-400';
}

function getTempColor(temp: number): string {
  if (temp >= 104) return 'text-red-400';
  if (temp >= 86) return 'text-orange-400';
  if (temp >= 68) return 'text-yellow-300';
  if (temp >= 50) return 'text-blue-300';
  return 'text-cyan-400';
}

function getHumidityColor(humidity: number): string {
  if (humidity >= 85) return 'text-teal-400';
  if (humidity >= 60) return 'text-blue-300';
  return 'text-sky-300';
}

function getWindColor(wind: number): string {
  if (wind >= 20) return 'text-purple-400';
  if (wind >= 10) return 'text-violet-300';
  return 'text-indigo-300';
}

export function LocationComparisonPanel() {
  const loc1 = useEnvironmentData();
  const loc2 = useEnvironmentData();

  return (
    <div className="w-full animate-fade-in flex flex-col gap-8">
      {/* ── Input Section ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full glass-panel rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        {/* Location 1 Input */}
        <div className="space-y-4 relative z-10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📍</span> Location A
          </h2>
          <form onSubmit={loc1.handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={loc1.location}
              onChange={(e) => loc1.setLocation(e.target.value)}
              placeholder="E.g., New York"
              className="flex-1 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <button
              type="submit"
              disabled={loc1.loading || !loc1.location.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.6)] shadow-blue-500/30 border border-white/10 hover:shadow-[0_0_25px_rgba(37,99,235,0.8)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              Load
            </button>
          </form>
          {loc1.error && <ErrorBanner message={loc1.error} />}
        </div>

        {/* Location 2 Input */}
        <div className="space-y-4 md:border-l md:border-[var(--color-border)] md:pl-6 relative z-10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📍</span> Location B
          </h2>
          <form onSubmit={loc2.handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={loc2.location}
              onChange={(e) => loc2.setLocation(e.target.value)}
              placeholder="E.g., London"
              className="flex-1 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
            <button
              type="submit"
              disabled={loc2.loading || !loc2.location.trim()}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(147,51,234,0.6)] shadow-purple-500/30 border border-white/10 hover:shadow-[0_0_25px_rgba(147,51,234,0.8)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              Load
            </button>
          </form>
          {loc2.error && <ErrorBanner message={loc2.error} />}
        </div>
      </div>

      {/* ── Comparison Results ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Location A Results */}
        <div className="w-full">
          {loc1.loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <LoadingShimmer key={i} height="h-28" />
                ))}
              </div>
              <LoadingShimmer height="h-40" />
            </div>
          ) : loc1.envData && loc1.explanation ? (
            <div className="space-y-4 animate-slide-in-right">
              <h3 className="text-xl font-bold text-white mb-2">{loc1.location}</h3>
              <div className="grid grid-cols-2 gap-4">
                <MetricCard label="Temp" value={`${Math.round(loc1.envData.temperature)}°`} unit="F" colorClass={getTempColor(loc1.envData.temperature)} />
                <MetricCard label="AQI" value={String(loc1.envData.aqi)} colorClass={getAqiColor(loc1.envData.aqi)} />
                <MetricCard label="Humidity" value={`${loc1.envData.humidity}`} unit="%" colorClass={getHumidityColor(loc1.envData.humidity)} />
                <MetricCard label="Wind" value={`${loc1.envData.windSpeed}`} unit="m/s" colorClass={getWindColor(loc1.envData.windSpeed)} />
              </div>
              <div className="bg-[var(--color-info-bg)] backdrop-blur-xl border border-blue-500/30 p-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                <p className="text-[var(--color-text-primary)] text-sm leading-relaxed">{loc1.explanation}</p>
              </div>
            </div>
          ) : (
            <div className="h-full glass-panel border-dashed rounded-2xl flex items-center justify-center p-8 text-center min-h-[300px]">
              <p className="text-[var(--color-text-muted)]">Search Location A to see data</p>
            </div>
          )}
        </div>

        {/* Location B Results */}
        <div className="w-full">
          {loc2.loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <LoadingShimmer key={i} height="h-28" />
                ))}
              </div>
              <LoadingShimmer height="h-40" />
            </div>
          ) : loc2.envData && loc2.explanation ? (
            <div className="space-y-4 animate-slide-in-right" style={{ animationDelay: '100ms' }}>
              <h3 className="text-xl font-bold text-white mb-2">{loc2.location}</h3>
              <div className="grid grid-cols-2 gap-4">
                <MetricCard label="Temp" value={`${Math.round(loc2.envData.temperature)}°`} unit="F" colorClass={getTempColor(loc2.envData.temperature)} />
                <MetricCard label="AQI" value={String(loc2.envData.aqi)} colorClass={getAqiColor(loc2.envData.aqi)} />
                <MetricCard label="Humidity" value={`${loc2.envData.humidity}`} unit="%" colorClass={getHumidityColor(loc2.envData.humidity)} />
                <MetricCard label="Wind" value={`${loc2.envData.windSpeed}`} unit="m/s" colorClass={getWindColor(loc2.envData.windSpeed)} />
              </div>
              <div className="bg-[var(--color-info-bg)] backdrop-blur-xl border border-purple-500/30 p-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                <p className="text-[var(--color-text-primary)] text-sm leading-relaxed">{loc2.explanation}</p>
              </div>
            </div>
          ) : (
            <div className="h-full glass-panel border-dashed rounded-2xl flex items-center justify-center p-8 text-center min-h-[300px]">
              <p className="text-[var(--color-text-muted)]">Search Location B to see data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
