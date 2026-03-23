'use client';

import { useState } from 'react';

const CONCERNS = [
  'Air Pollution',
  'Heat Wave',
  'UV Exposure',
  'Flooding',
  'Wildfire Smoke',
];

interface EnvironmentData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  aqi: number;
  aqiLabel: string;
  description: string;
}

export default function Home() {
  const [location, setLocation] = useState('');
  const [concern, setConcern] = useState(CONCERNS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [envData, setEnvData] = useState<EnvironmentData | null>(null);
  const [explanation, setExplanation] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    setLoading(true);
    setError('');
    setEnvData(null);
    setExplanation('');

    try {
      // 1. Fetch Environment Data
      const envRes = await fetch(`/api/environment?location=${encodeURIComponent(location)}`);
      if (!envRes.ok) {
        throw new Error('Failed to fetch environment data. Please check location or API keys.');
      }
      const envJson = await envRes.json();
      setEnvData(envJson);

      // 2. Fetch AI Explanation
      const explainRes = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location,
          concern,
          environmentData: envJson,
        }),
      });

      if (!explainRes.ok) {
        throw new Error('Failed to generate explanation. Please check AI API key.');
      }
      const explainJson = await explainRes.json();
      setExplanation(explainJson.explanation);

    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto flex flex-col items-center">
      <header className="w-full text-center mb-10 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
          What's Happening <span className="text-[var(--color-accent)]">Around Me?</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto">
          Understand local environmental conditions with simple, AI-powered explanations.
        </p>
      </header>

      <div className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 shadow-2xl mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="location" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
              Where are you?
            </label>
            <input
              id="location"
              type="text"
              placeholder="e.g. New York, London, Tokyo..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
              required
            />
          </div>
          
          <div className="flex-1 md:max-w-[250px]">
            <label htmlFor="concern" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
              Top Concern
            </label>
            <select
              id="concern"
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all appearance-none cursor-pointer"
            >
              {CONCERNS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || !location.trim()}
              className="w-full md:w-auto bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold py-3 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking...
                </>
              ) : (
                'Explain It'
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 text-center animate-fade-in">
          {error}
        </div>
      )}

      {loading && !envData && (
        <div className="w-full space-y-4 animate-fade-in">
          <div className="h-24 rounded-xl loading-shimmer"></div>
          <div className="h-32 rounded-xl loading-shimmer"></div>
        </div>
      )}

      {envData && explanation && (
        <div className="w-full space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 rounded-xl text-center">
              <p className="text-[var(--color-text-muted)] text-sm mb-1">Temperature</p>
              <p className="text-2xl font-bold text-white">{Math.round(envData.temperature)}°C</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 capitalize">{envData.description}</p>
            </div>
            
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 rounded-xl text-center">
              <p className="text-[var(--color-text-muted)] text-sm mb-1">Air Quality</p>
              <p className="text-2xl font-bold text-white">AQI {envData.aqi}</p>
              <p className={`text-xs mt-1 font-medium ${
                envData.aqi <= 50 ? 'text-[var(--color-good)]' : 
                envData.aqi <= 100 ? 'text-[var(--color-moderate)]' : 
                envData.aqi <= 150 ? 'text-[var(--color-bad)]' : 'text-[var(--color-danger)]'
              }`}>
                {envData.aqiLabel}
              </p>
            </div>

            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 rounded-xl text-center">
              <p className="text-[var(--color-text-muted)] text-sm mb-1">Humidity</p>
              <p className="text-2xl font-bold text-white">{envData.humidity}%</p>
            </div>

            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 rounded-xl text-center">
              <p className="text-[var(--color-text-muted)] text-sm mb-1">Wind</p>
              <p className="text-2xl font-bold text-white">{envData.windSpeed} m/s</p>
            </div>
          </div>

          <div className="bg-[var(--color-info-bg)] border border-[var(--color-accent)] border-opacity-30 p-6 md:p-8 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-accent)]"></div>
            <div className="flex items-start gap-4">
              <div className="bg-[var(--color-accent)] text-white p-2 rounded-lg mt-1 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Here's the deal with {concern.toLowerCase()} today:</h3>
                <p className="text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                  {explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
