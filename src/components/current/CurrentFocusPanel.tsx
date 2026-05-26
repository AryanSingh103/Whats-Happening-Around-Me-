'use client';

import { CONCERNS, QUICK_CITIES } from '@/lib/constants';
import { useEnvironmentData } from '@/hooks/useEnvironmentData';
import { MetricCard } from '@/components/ui/MetricCard';
import { LoadingShimmer } from '@/components/ui/LoadingShimmer';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { EnvironmentData } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { exportCSV, exportJSON, exportPDF } from '@/lib/export';
import { fetchGeocode } from '@/lib/api';
import { HistoricalTrendChart } from './HistoricalTrendChart';
import { Map, Marker } from 'pigeon-maps';

interface CurrentFocusPanelProps {
  envData: EnvironmentData | null;
  onDataFetched?: (location: string, concern: string, data: EnvironmentData) => void;
  initialLocation?: string;
}

interface Alert {
  label: string;
  className: string;
  icon: string;
  pulse?: boolean;
}

function getAlerts(data: EnvironmentData): Alert[] {
  const alerts: Alert[] = [];

  // AQI alerts
  if (data.aqi > 200) {
    alerts.push({ label: 'HAZARDOUS AIR — Stay indoors, close windows', className: 'bg-red-500/15 border-red-500/30 text-red-300', icon: '🫁', pulse: true });
  } else if (data.aqi > 150) {
    alerts.push({ label: 'Unhealthy Air — Limit prolonged outdoor activity', className: 'bg-orange-500/15 border-orange-500/30 text-orange-300', icon: '😷' });
  } else if (data.aqi > 100) {
    alerts.push({ label: 'Air Quality Caution — Sensitive groups should take care', className: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300', icon: '⚠️' });
  }

  // Temperature alerts
  if (data.temperature >= 104) {
    alerts.push({ label: 'EXTREME HEAT ADVISORY — Dangerous temperatures, stay hydrated', className: 'bg-red-500/15 border-red-500/30 text-red-300', icon: '🔥', pulse: true });
  } else if (data.temperature >= 95) {
    alerts.push({ label: 'Heat Warning — High temperatures, limit sun exposure', className: 'bg-orange-500/15 border-orange-500/30 text-orange-300', icon: '🌡️' });
  } else if (data.temperature <= 5) {
    alerts.push({ label: 'EXTREME COLD WARNING — Risk of frostbite, stay warm', className: 'bg-blue-500/15 border-blue-500/30 text-blue-300', icon: '🥶', pulse: true });
  } else if (data.temperature <= 32) {
    alerts.push({ label: 'Frost Advisory — Below freezing temperatures', className: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300', icon: '❄️' });
  }

  // Wind alerts
  if (data.windSpeed >= 20) {
    alerts.push({ label: 'HIGH WIND WARNING — Dangerous wind conditions', className: 'bg-purple-500/15 border-purple-500/30 text-purple-300', icon: '💨', pulse: true });
  } else if (data.windSpeed >= 10) {
    alerts.push({ label: 'Wind Advisory — Strong winds expected', className: 'bg-purple-500/15 border-purple-500/30 text-purple-300', icon: '🌬️' });
  }

  // Humidity alerts
  if (data.humidity >= 85) {
    alerts.push({ label: 'Very High Humidity — Outdoor exertion may feel oppressive', className: 'bg-teal-500/15 border-teal-500/30 text-teal-300', icon: '💧' });
  } else if (data.humidity <= 20) {
    alerts.push({ label: 'Very Dry Air — Stay hydrated, risk of irritation', className: 'bg-amber-500/15 border-amber-500/30 text-amber-300', icon: '🏜️' });
  }

  return alerts;
}

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

export function CurrentFocusPanel({ onDataFetched, initialLocation }: CurrentFocusPanelProps) {
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
  } = useEnvironmentData(onDataFetched);

  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]); // Default to NYC
  const [mapZoom, setMapZoom] = useState(3);
  const [isMapLoading, setIsMapLoading] = useState(false);

  // Sync map center if envData provides lat/lon
  useEffect(() => {
    if (envData?.lat !== undefined && envData?.lon !== undefined) {
      setMapCenter([envData.lat, envData.lon]);
      setMapZoom(11);
    }
  }, [envData]);

  const handleMapClick = async ({ latLng }: { latLng: [number, number] }) => {
    setMapCenter(latLng);
    setIsMapLoading(true);
    try {
      const data = await fetchGeocode(latLng[0], latLng[1]);
      if (data.error) throw new Error(data.error);
      setLocation(data.city);
      await fetchData(data.city);
      setMapZoom(11);
    } catch (err: any) {
      console.error('Map click error:', err);
    } finally {
      setIsMapLoading(false);
    }
  };

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    await handleSubmit(e);
  }, [handleSubmit]);

  // If an initial location is provided (e.g. from history), auto-fetch it
  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
      fetchData(initialLocation);
    }
    // Only run on mount (initialLocation doesn't change after mount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const alerts = envData ? getAlerts(envData) : [];

  return (
    <div className="w-full animate-fade-in relative z-10">
      {/* ── Input Card ── */}
      <div className="w-full glass-panel rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        <div className="flex flex-col gap-6 relative z-10">
          <form onSubmit={handleFormSubmit} className="flex flex-col md:flex-row gap-4 w-full">
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
              className="w-full bg-[var(--color-bg-input)] border border-white/5 rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all shadow-inner"
              required
            />
          </div>

          <div className="flex-1 md:max-w-[200px]">
            <label htmlFor="concern-select" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Top Concern</label>
            <select
              id="concern-select"
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              className="w-full bg-[var(--color-bg-input)] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all cursor-pointer shadow-inner"
            >
              {CONCERNS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="mt-6 md:mt-7 w-full md:w-auto bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-[0_0_15px_var(--color-accent)] shadow-[var(--color-accent)]/30 border border-white/10 hover:shadow-[0_0_25px_var(--color-accent)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading
                </>
              ) : (
                'Explain It'
              )}
            </button>
          </div>
        </form>

          {/* ── Integrated Interactive Map ── */}
          <div className="w-full flex flex-col gap-2 mt-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Interactive Map Selection
              </label>
              {isMapLoading && <span className="text-xs text-[var(--color-accent)] animate-pulse">Fetching location...</span>}
            </div>
            <div className="w-full h-[180px] md:h-[220px] rounded-xl overflow-hidden border border-white/5 relative bg-[var(--color-bg-input)] group cursor-crosshair shadow-inner">
              <Map
                center={mapCenter}
                zoom={mapZoom}
                onBoundsChanged={({ center, zoom }) => {
                  setMapCenter(center);
                  setMapZoom(zoom);
                }}
                onClick={handleMapClick}
                provider={(x, y, z) => `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`}
              >
                <Marker width={35} anchor={mapCenter} color="var(--color-accent)" />
              </Map>
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center z-10">
                <span className="text-white text-sm font-semibold bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm shadow-xl">Click anywhere to detect location</span>
              </div>
            </div>
          </div>
        </div>
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
                className="px-4 py-2 glass-panel rounded-full text-sm text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-accent)]/50 transition-all hover:shadow-[0_0_15px_var(--color-accent)] hover:shadow-[var(--color-accent)]/20 hover:-translate-y-0.5"
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
          {/* Alert Banners */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`w-full p-3.5 rounded-xl border text-sm font-medium flex items-center gap-3 animate-fade-in ${alert.className} ${alert.pulse ? 'animate-pulse-soft' : ''}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span className="text-lg shrink-0">{alert.icon}</span>
                  <span>{alert.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Temperature" value={`${Math.round(envData.temperature)}°`} unit="F" colorClass={getTempColor(envData.temperature)} delay={0} />
            <MetricCard label="AQI" value={String(envData.aqi)} colorClass={getAqiColor(envData.aqi)} delay={75} />
            <MetricCard label="Humidity" value={`${envData.humidity}`} unit="%" colorClass={getHumidityColor(envData.humidity)} delay={150} />
            <MetricCard label="Wind" value={`${envData.windSpeed}`} unit="m/s" colorClass={getWindColor(envData.windSpeed)} delay={225} />
          </div>

          {/* Explanation Card */}
          <div className="bg-[var(--color-info-bg)] backdrop-blur-xl border border-[var(--color-accent)]/30 p-6 md:p-8 rounded-2xl relative overflow-hidden animate-fade-in shadow-[0_8px_32px_rgba(0,0,0,0.2)]" style={{ animationDelay: '300ms' }}>
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-accent)] shadow-[0_0_15px_var(--color-accent)]"></div>
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

          {/* Historical Trend Chart */}
          <HistoricalTrendChart currentData={envData} />

          {/* Export Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <button
              onClick={() => exportCSV(location, concern, explanation, envData)}
              className="flex items-center gap-1.5 px-4 py-2 glass-panel rounded-xl text-sm text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-accent)]/50 transition-all hover:shadow-[0_0_10px_var(--color-accent)] hover:shadow-[var(--color-accent)]/20"
              aria-label="Export as CSV"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              CSV
            </button>
            <button
              onClick={() => exportJSON(location, concern, explanation, envData)}
              className="flex items-center gap-1.5 px-4 py-2 glass-panel rounded-xl text-sm text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-accent)]/50 transition-all hover:shadow-[0_0_10px_var(--color-accent)] hover:shadow-[var(--color-accent)]/20"
              aria-label="Export as JSON"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              JSON
            </button>
            <button
              onClick={() => exportPDF(location, concern, explanation, envData)}
              className="flex items-center gap-1.5 px-4 py-2 glass-panel rounded-xl text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)]/50 transition-all hover:shadow-[0_0_10px_var(--color-danger)] hover:shadow-[var(--color-danger)]/20"
              aria-label="Export as PDF report"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              PDF Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
