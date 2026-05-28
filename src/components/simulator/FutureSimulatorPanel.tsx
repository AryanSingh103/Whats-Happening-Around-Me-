'use client';

import { SCENARIOS } from '@/lib/constants';
import { useSimulation } from '@/hooks/useSimulation';
import { LoadingShimmer } from '@/components/ui/LoadingShimmer';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { ClimateProjectionChart } from './ClimateProjectionChart';
import { useState, useCallback } from 'react';
import { fetchGeocode } from '@/lib/api';

// ── Quick-chip presets ──
const YEAR_CHIPS = [
  { label: '+10 Years', value: 10 },
  { label: '+25 Years', value: 25 },
  { label: '+50 Years', value: 50 },
];

// ── Trajectory-based dynamic theme ──
function getTrajectoryTheme(trajectory: number) {
  switch (trajectory) {
    case 1:
      return {
        accent: '#22c55e',
        accentHover: '#16a34a',
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-900/10',
        glow: 'shadow-[0_0_40px_rgba(34,197,94,0.1)]',
        iconBg: 'bg-emerald-500',
        iconShadow: 'shadow-emerald-500/20',
        textAccent: 'text-emerald-300',
        metricBorder: 'hover:border-emerald-500/50',
        metricShadow: 'hover:shadow-emerald-500/5',
        contextBg: 'bg-emerald-500/10',
        contextText: 'text-emerald-300',
        storyText: 'text-emerald-100/90',
        buttonBg: 'bg-emerald-600 hover:bg-emerald-500',
        buttonShadow: 'shadow-[0_0_15px_rgba(34,197,94,0.6)]',
        pulse: false,
        emoji: '🌱',
        label: 'Cleaner Future',
      };
    case 3:
      return {
        accent: '#ef4444',
        accentHover: '#dc2626',
        border: 'border-red-500/30',
        bg: 'bg-red-900/10',
        glow: 'shadow-[0_0_40px_rgba(239,68,68,0.15)]',
        iconBg: 'bg-red-500',
        iconShadow: 'shadow-red-500/20',
        textAccent: 'text-red-300',
        metricBorder: 'hover:border-red-500/50',
        metricShadow: 'hover:shadow-red-500/5',
        contextBg: 'bg-red-500/10',
        contextText: 'text-red-300',
        storyText: 'text-red-100/90',
        buttonBg: 'bg-red-600 hover:bg-red-500',
        buttonShadow: 'shadow-[0_0_15px_rgba(239,68,68,0.6)]',
        pulse: true,
        emoji: '🔥',
        label: 'Extreme Reality',
      };
    default:
      return {
        accent: '#a855f7',
        accentHover: '#9333ea',
        border: 'border-purple-500/30',
        bg: 'bg-purple-900/10',
        glow: 'shadow-[0_0_40px_rgba(168,85,247,0.1)]',
        iconBg: 'bg-purple-500',
        iconShadow: 'shadow-purple-500/20',
        textAccent: 'text-purple-300',
        metricBorder: 'hover:border-purple-500/50',
        metricShadow: 'hover:shadow-purple-500/5',
        contextBg: 'bg-purple-500/10',
        contextText: 'text-purple-300',
        storyText: 'text-purple-100/90',
        buttonBg: 'bg-purple-600 hover:bg-purple-500',
        buttonShadow: 'shadow-[0_0_15px_rgba(168,85,247,0.6)]',
        pulse: false,
        emoji: '⚡',
        label: 'Current Path',
      };
  }
}

interface FutureSimulatorPanelProps {
  onConsultChat?: (message: string) => void;
}

export function FutureSimulatorPanel({ onConsultChat }: FutureSimulatorPanelProps) {
  const sim = useSimulation();
  const theme = getTrajectoryTheme(sim.simTrajectory);

  // ── Geolocation state ──
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState('');

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setLocateError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocateError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const data = await fetchGeocode(latitude, longitude);
          if (data.error) throw new Error(data.error);
          sim.setSimCity(data.city);
        } catch (err: any) {
          setLocateError(err.message || 'Could not find your city.');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        setLocateError(
          'Unable to retrieve your location. Browser may require HTTPS or Location access is denied.'
        );
      }
    );
  }, [sim]);

  // ── Consult Eco-Assistant handler ──
  const handleConsultChat = useCallback(() => {
    if (!sim.simData || !onConsultChat) return;

    const metricsText = sim.simData.metrics
      .map((m) => `• ${m.name}: ${m.value} (${m.context})`)
      .join('\n');

    const prompt = `I just ran a climate simulation for ${sim.simCity} looking ${sim.yearsInFuture} years into the future (year ${sim.simFutureYear}) under the "${theme.label}" trajectory, focused on "${sim.simScenario}". Here are the projected metrics:\n${metricsText}\n\nThe simulation story said: "${sim.simData.story}"\n\nWhat practical steps can I take today to help prevent or adapt to this future? What can communities and governments do?`;

    onConsultChat(prompt);
  }, [sim.simData, sim.simCity, sim.yearsInFuture, sim.simFutureYear, sim.simScenario, theme.label, onConsultChat]);

  return (
    <div className="w-full animate-fade-in">
      <div className="w-full glass-panel rounded-2xl p-6 md:p-8 shadow-2xl mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        <form onSubmit={sim.handleSubmit} className="flex flex-col gap-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-4">
            {/* ── Years in Future + Quick Chips ── */}
            <div className="flex-1 md:max-w-[200px]">
              <label htmlFor="years-in-future" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Years in Future</label>
              <input id="years-in-future" type="number" min="1" max="100" placeholder="e.g. 30" value={sim.yearsInFuture} onChange={(e) => sim.setYearsInFuture(e.target.valueAsNumber || '')} className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" required />
              {/* Quick Chips */}
              <div className="flex gap-1.5 mt-2">
                {YEAR_CHIPS.map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => sim.setYearsInFuture(chip.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      sim.yearsInFuture === chip.value
                        ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                        : 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:text-white hover:border-purple-500/30'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── City + Detect Location ── */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="sim-city" className="block text-sm font-medium text-[var(--color-text-muted)]">City</label>
                <button
                  type="button"
                  onClick={handleLocateMe}
                  disabled={isLocating}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                  aria-label="Detect city location"
                >
                  {isLocating ? (
                    <>
                      <div className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                      Locating...
                    </>
                  ) : (
                    <>
                      <span>📍</span> Detect Location
                    </>
                  )}
                </button>
              </div>
              <input id="sim-city" type="text" placeholder="e.g. Miami, Mumbai..." value={sim.simCity} onChange={(e) => sim.setSimCity(e.target.value)} className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" required />
              {locateError && <p className="text-red-400 text-xs mt-1">{locateError}</p>}
            </div>

            {/* ── Scenario ── */}
            <div className="flex-1">
              <label htmlFor="sim-scenario" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Scenario</label>
              <select id="sim-scenario" value={sim.simScenario} onChange={(e) => sim.setSimScenario(e.target.value)} className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all cursor-pointer">
                {SCENARIOS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* ── Trajectory Slider ── */}
          <div className="pt-4 border-t border-[var(--color-border)]">
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-4">World Trajectory Twist</label>
            <div className="relative w-full px-2 mb-8">
              <input type="range" min="1" max="3" step="1" value={sim.simTrajectory} onChange={(e) => sim.setSimTrajectory(parseInt(e.target.value))} className="w-full h-2 bg-[var(--color-bg-input)] rounded-lg appearance-none cursor-pointer accent-purple-500" aria-label="World trajectory slider" />
              <div className="flex justify-between text-xs font-medium text-[var(--color-text-muted)] mt-3 px-1">
                <span className={sim.simTrajectory === 1 ? 'text-green-400 font-bold' : ''}>🌱 Cleaner Future</span>
                <span className={sim.simTrajectory === 2 ? 'text-yellow-400 font-bold' : ''}>⚡ Current Path</span>
                <span className={sim.simTrajectory === 3 ? 'text-red-400 font-bold' : ''}>🔥 +2°C World</span>
              </div>
            </div>
          </div>

          {/* ── Submit ── */}
          <div className="flex justify-center mt-2">
            <button type="submit" disabled={sim.simLoading || !sim.simCity.trim() || !sim.yearsInFuture || sim.yearsInFuture <= 0} className={`w-full md:w-auto ${theme.buttonBg} text-white font-semibold py-3 px-10 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.98]`}>
              {sim.simLoading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Simulating...</>) : (<>🔮 Glimpse the Future</>)}
            </button>
          </div>
        </form>
      </div>

      <ErrorBanner message={sim.simError} />

      {/* ── Empty State ── */}
      {!sim.simLoading && !sim.simData && !sim.simError && (
        <div className="w-full text-center py-16 animate-fade-in">
          <div className="text-6xl mb-6">🔮</div>
          <h3 className="text-xl font-semibold text-white mb-2">See Your Future</h3>
          <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">Enter how many years into the future you want to look, a city, and an environmental scenario to see an AI-generated projection of what daily life could feel like.</p>
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {sim.simLoading && !sim.simData && (
        <div className="w-full space-y-4"><LoadingShimmer height="h-24" /><LoadingShimmer height="h-40" /></div>
      )}

      {/* ── Results ── */}
      {sim.simData && (
        <div className="space-y-6 animate-fade-in mt-6">
          {/* Story Card — dynamically themed */}
          <div className={`${theme.bg} border ${theme.border} p-6 md:p-8 rounded-2xl relative overflow-hidden ${theme.glow} ${theme.pulse ? 'animate-pulse-soft' : ''}`}>
            <div className={`absolute top-0 left-0 w-1 h-full ${theme.iconBg}`}></div>
            <div className="flex items-start gap-4">
              <div className={`${theme.iconBg} text-white p-2.5 rounded-lg shrink-0 shadow-lg ${theme.iconShadow}`}>{theme.emoji}</div>
              <div className="w-full">
                <h3 className="text-xl font-bold text-white mb-3">Life in {sim.simFutureYear} ({sim.yearsInFuture} Years from Now)</h3>
                <p className={`${theme.storyText} leading-relaxed text-lg whitespace-pre-wrap`}>{sim.simData.story}</p>
              </div>
            </div>
          </div>

          {/* Metric Cards — dynamically themed */}
          {sim.simData.metrics && sim.simData.metrics.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sim.simData.metrics.map((metric, idx) => (
                <div key={idx} className={`bg-[var(--color-bg-card)] border border-[var(--color-border)] p-5 rounded-2xl relative overflow-hidden group ${theme.metricBorder} transition-all shadow-lg ${theme.metricShadow} animate-fade-in hover:-translate-y-0.5`} style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-[var(--color-text-muted)] line-clamp-1">{metric.name}</p>
                    {metric.trend === 'bad' && <span className="text-red-400 text-xs font-bold bg-red-400/10 px-2 py-0.5 rounded-full">SEVERE</span>}
                    {metric.trend === 'good' && <span className="text-green-400 text-xs font-bold bg-green-400/10 px-2 py-0.5 rounded-full">IMPROVED</span>}
                    {metric.trend !== 'bad' && metric.trend !== 'good' && <span className="text-yellow-400 text-xs font-bold bg-yellow-400/10 px-2 py-0.5 rounded-full">CHANGED</span>}
                  </div>
                  <p className="text-3xl font-extrabold text-white tracking-tight mb-2">{metric.value}</p>
                  <p className={`text-sm ${theme.contextText} ${theme.contextBg} px-3 py-1.5 rounded-lg inline-block w-full`}>{metric.context}</p>
                </div>
              ))}
            </div>
          )}

          {/* Climate Projection Chart */}
          <ClimateProjectionChart
            yearsInFuture={typeof sim.yearsInFuture === 'number' ? sim.yearsInFuture : 30}
            trajectory={sim.simTrajectory}
          />

          {/* Consult Eco-Assistant Button */}
          {onConsultChat && (
            <div className="flex justify-center pt-2 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <button
                onClick={handleConsultChat}
                className="flex items-center gap-2.5 px-6 py-3 bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(5,150,105,0.4)] border border-emerald-400/20 hover:shadow-[0_0_30px_rgba(5,150,105,0.6)] hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span className="text-lg">💬</span>
                Ask Eco-Assistant How to Prevent This
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
