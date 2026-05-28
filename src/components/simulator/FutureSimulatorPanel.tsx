'use client';

import { SCENARIOS } from '@/lib/constants';
import { useSimulation } from '@/hooks/useSimulation';
import { LoadingShimmer } from '@/components/ui/LoadingShimmer';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

export function FutureSimulatorPanel() {
  const sim = useSimulation();

  return (
    <div className="w-full animate-fade-in">
      <div className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
        <form onSubmit={sim.handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 md:max-w-[160px]">
              <label htmlFor="years-in-future" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Years in Future</label>
              <input id="years-in-future" type="number" min="1" max="100" placeholder="e.g. 30" value={sim.yearsInFuture} onChange={(e) => sim.setYearsInFuture(e.target.valueAsNumber || '')} className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" required />
            </div>
            <div className="flex-1">
              <label htmlFor="sim-city" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">City</label>
              <input id="sim-city" type="text" placeholder="e.g. Miami, Mumbai..." value={sim.simCity} onChange={(e) => sim.setSimCity(e.target.value)} className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" required />
            </div>
            <div className="flex-1">
              <label htmlFor="sim-scenario" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Scenario</label>
              <select id="sim-scenario" value={sim.simScenario} onChange={(e) => sim.setSimScenario(e.target.value)} className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all cursor-pointer">
                {SCENARIOS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

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

          <div className="flex justify-center mt-2">
            <button type="submit" disabled={sim.simLoading || !sim.simCity.trim() || !sim.yearsInFuture || sim.yearsInFuture <= 0} className="w-full md:w-auto bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-10 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.98]">
              {sim.simLoading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Simulating...</>) : (<>🔮 Glimpse the Future</>)}
            </button>
          </div>
        </form>
      </div>

      <ErrorBanner message={sim.simError} />

      {!sim.simLoading && !sim.simData && !sim.simError && (
        <div className="w-full text-center py-16 animate-fade-in">
          <div className="text-6xl mb-6">🔮</div>
          <h3 className="text-xl font-semibold text-white mb-2">See Your Future</h3>
          <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">Enter how many years into the future you want to look, a city, and an environmental scenario to see an AI-generated projection of what daily life could feel like.</p>
        </div>
      )}

      {sim.simLoading && !sim.simData && (
        <div className="w-full space-y-4"><LoadingShimmer height="h-24" /><LoadingShimmer height="h-40" /></div>
      )}

      {sim.simData && (
        <div className="space-y-6 animate-fade-in mt-6">
          <div className="bg-purple-900/10 border border-purple-500/30 p-6 md:p-8 rounded-2xl relative overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.1)]">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
            <div className="flex items-start gap-4">
              <div className="bg-purple-500 text-white p-2.5 rounded-lg shrink-0 shadow-lg shadow-purple-500/20">🔮</div>
              <div className="w-full">
                <h3 className="text-xl font-bold text-white mb-3">Life in {sim.simFutureYear} ({sim.yearsInFuture} Years from Now)</h3>
                <p className="text-purple-100/90 leading-relaxed text-lg whitespace-pre-wrap">{sim.simData.story}</p>
              </div>
            </div>
          </div>

          {sim.simData.metrics && sim.simData.metrics.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sim.simData.metrics.map((metric, idx) => (
                <div key={idx} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/5 animate-fade-in hover:-translate-y-0.5" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-[var(--color-text-muted)] line-clamp-1">{metric.name}</p>
                    {metric.trend === 'bad' && <span className="text-red-400 text-xs font-bold bg-red-400/10 px-2 py-0.5 rounded-full">SEVERE</span>}
                    {metric.trend === 'good' && <span className="text-green-400 text-xs font-bold bg-green-400/10 px-2 py-0.5 rounded-full">IMPROVED</span>}
                    {metric.trend !== 'bad' && metric.trend !== 'good' && <span className="text-yellow-400 text-xs font-bold bg-yellow-400/10 px-2 py-0.5 rounded-full">CHANGED</span>}
                  </div>
                  <p className="text-3xl font-extrabold text-white tracking-tight mb-2">{metric.value}</p>
                  <p className="text-sm text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-lg inline-block w-full">{metric.context}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
