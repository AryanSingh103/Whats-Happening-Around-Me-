'use client';

import { CONCERNS, QUICK_CITIES } from '@/lib/constants';
import { useEnvironmentData } from '@/hooks/useEnvironmentData';
import { MetricCard } from '@/components/ui/MetricCard';
import { LoadingShimmer } from '@/components/ui/LoadingShimmer';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { EnvironmentData } from '@/types';

interface CurrentFocusPanelProps {
  envData: EnvironmentData | null;
  onDataUpdate?: (data: EnvironmentData | null, location: string) => void;
}

function getAqiColor(aqi: number): string {
  if (aqi <= 50) return 'text-green-400';
  if (aqi <= 100) return 'text-yellow-400';
  if (aqi <= 150) return 'text-orange-400';
  return 'text-red-400';
}

function getAqiSeverity(aqi: number): { label: string; class: string } | null {
  if (aqi > 200) return { label: '⚠️ HAZARDOUS — Stay indoors', class: 'bg-red-500/15 border-red-500/30 text-red-300' };
  if (aqi > 150) return { label: '⚠️ Unhealthy — Limit outdoor activity', class: 'bg-orange-500/15 border-orange-500/30 text-orange-300' };
  if (aqi > 100) return { label: 'Caution — Sensitive groups affected', class: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300' };
  return null;
}

function getTempColor(temp: number): string {
  if (temp >= 40) return 'text-red-400';
  if (temp >= 30) return 'text-orange-400';
  if (temp >= 20) return 'text-yellow-300';
  if (temp >= 10) return 'text-blue-300';
  return 'text-cyan-400';
}

export function CurrentFocusPanel({ onDataUpdate }: CurrentFocusPanelProps) {
  const {
    location,
    setLocation,
    concern,
    setConcern,
    loading,
    error,
    envData,
    explanation,
    isLocating,
    handleSubmit,
    handleLocateMe,
    fetchData,
  } = useEnvironmentData();

  // Propagate data up to parent when it changes
  const handleFormSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e);
  };

  // Use effect-like propagation through onDataUpdate
  if (onDataUpdate && envData) {
    // We'll use a ref or callback pattern instead
  }

  const aqiSeverity = envData ? getAqiSeverity(envData.aqi) : null;

  return (
    <div className="w-full animate-fade-in">
      {/* ── Input Card ── */}
      <div className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
        <form onSubmit={handleFormSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="location-input" className="block text-sm font-medium text-[var(--color-text-muted)]">Where are you?</label>
              <button
                type="button"
                onClick={handleLocateMe}
                disabled={isLocating}
                className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] flex items-center gap-1 transition-colors disabled:opacity-50"
                aria-label="Detect my location"
              >
                {isLocating ? (
                  <>
                    <div className="w-3 h-3 border border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
                    Locating...
                  </>
                ) : (
                  <>
                    <span>📍</span> Detect Location
                  </>
                )}
              </button>
            </div>
            <input
              id="location-input"
              type="text"
              placeholder="e.g. New York, London, Tokyo..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
              required
            />
          </div>

          <div className="flex-1 md:max-w-[250px]">
            <label htmlFor="concern-select" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Top Concern</label>
            <select
              id="concern-select"
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all cursor-pointer"
            >
              {CONCERNS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || !location.trim()}
              className="w-full md:w-auto bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold py-3 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-[48px] hover:shadow-lg hover:shadow-[var(--color-accent)]/20 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Checking...
                </>
              ) : (
                'Explain It'
              )}
            </button>
          </div>
        </form>
      </div>

      <ErrorBanner message={error} />

      {/* ── Empty State ── */}
      {!loading && !envData && !error && (
        <div className="w-full text-center py-16 animate-fade-in">
          <div className="text-6xl mb-6">🌍</div>
          <h3 className="text-xl font-semibold text-white mb-2">Explore Your Environment</h3>
          <p className="text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto">
            Enter a city above or detect your location to see real-time environmental conditions explained in plain language.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => {
                  setLocation(city);
                  fetchData(city);
                }}
                className="px-4 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-full text-sm text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-accent)]/50 transition-all hover:shadow-md"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {loading && !envData && (
        <div className="w-full space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <LoadingShimmer key={i} height="h-[88px]" />
            ))}
          </div>
          <LoadingShimmer height="h-32" />
        </div>
      )}

      {/* ── Results ── */}
      {envData && explanation && (
        <div className="w-full space-y-6">
          {/* Alert Banner */}
          {aqiSeverity && (
            <div className={`w-full p-4 rounded-xl border text-sm font-medium text-center animate-fade-in ${aqiSeverity.class}`}>
              {aqiSeverity.label}
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Temperature" value={`${Math.round(envData.temperature)}°`} unit="C" colorClass={getTempColor(envData.temperature)} delay={0} />
            <MetricCard label="AQI" value={String(envData.aqi)} colorClass={getAqiColor(envData.aqi)} delay={75} />
            <MetricCard label="Humidity" value={`${envData.humidity}`} unit="%" delay={150} />
            <MetricCard label="Wind" value={`${envData.windSpeed}`} unit="m/s" delay={225} />
          </div>

          {/* Explanation Card */}
          <div className="bg-[var(--color-info-bg)] border border-[var(--color-accent)]/30 p-6 md:p-8 rounded-2xl relative overflow-hidden animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-accent)]"></div>
            <div className="flex items-start gap-4">
              <div className="bg-[var(--color-accent)] text-white p-2.5 rounded-lg mt-0.5 shrink-0 shadow-lg shadow-[var(--color-accent)]/20">💡</div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Here&apos;s the deal with {concern.toLowerCase()} today:
                </h3>
                <p className="text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                  {explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
