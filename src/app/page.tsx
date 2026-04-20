'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const CONCERNS = [
  'Air Pollution',
  'Heat Wave',
  'UV Exposure',
  'Flooding',
  'Wildfire Smoke',
];

const SCENARIOS = [
  'Extreme Heat Waves',
  'Rising Sea Levels',
  'Worsening Air Pollution',
  'Increasing Wildfires',
  'Severe Storms'
];

const TRAJECTORIES = [
  { value: 1, label: 'Cleaner Future' },
  { value: 2, label: 'Current Path' },
  { value: 3, label: 'Extreme Reality' }
];

interface EnvironmentData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  aqi: number;
  aqiLabel: string;
  description: string;
}

interface SimMetric {
  name: string;
  value: string;
  context: string;
  trend: 'bad' | 'good' | 'neutral';
}

interface SimData {
  story: string;
  metrics: SimMetric[];
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'current' | 'future' | 'chat'>('current');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- Current Conditions State ---
  const [location, setLocation] = useState('');
  const [concern, setConcern] = useState(CONCERNS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [envData, setEnvData] = useState<EnvironmentData | null>(null);
  const [explanation, setExplanation] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // --- Future Simulator State ---
  const [currentAge, setCurrentAge] = useState<number | ''>('');
  const [simAge, setSimAge] = useState<number | ''>('');
  const [simCity, setSimCity] = useState('');
  const [simScenario, setSimScenario] = useState(SCENARIOS[0]);
  const [simTrajectory, setSimTrajectory] = useState(2); // Default to Current Path
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState('');
  const [simData, setSimData] = useState<SimData | null>(null);
  const [simFutureYear, setSimFutureYear] = useState<number | null>(null);

  // --- Chat State ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: "Hi there! I'm your Eco-Assistant. Ask me anything about climate science, local weather patterns, or environmental data!"
  }]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatError('');
    setIsChatLoading(true);

    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: userMsg }];
    setChatMessages(newMessages);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          contextData: envData
        }),
      });

      if (!res.ok) throw new Error('Failed to get response');
      const data = await res.json();
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err: any) {
      setChatError(err.message || 'Something went wrong connecting to the AI.');
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- Current Tab Handler ---
  const fetchCurrentData = async (locToFetch: string) => {
    if (!locToFetch.trim()) return;

    setLoading(true);
    setError('');
    setEnvData(null);
    setExplanation('');

    try {
      const envRes = await fetch(`/api/environment?location=${encodeURIComponent(locToFetch)}`);
      if (!envRes.ok) throw new Error('Failed to fetch environment data. Please check location or API keys.');
      const envJson = await envRes.json();
      setEnvData(envJson);

      const explainRes = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: locToFetch, concern, environmentData: envJson }),
      });

      if (!explainRes.ok) throw new Error('Failed to generate explanation. Please check AI API key.');
      const explainJson = await explainRes.json();
      setExplanation(explainJson.explanation);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchCurrentData(location);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`);
          if (!res.ok) throw new Error('Failed to determine city from location.');
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          
          setLocation(data.city);
          await fetchCurrentData(data.city);
        } catch (err: any) {
          setError(err.message || 'Could not find your city.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        setError('Unable to retrieve your location. Browser may require HTTPS or Location access is denied.');
      }
    );
  };

  // --- Future Tab Handler ---
  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simCity.trim() || !simAge || !currentAge || simAge <= currentAge) {
      if (typeof simAge === 'number' && typeof currentAge === 'number' && simAge <= currentAge) {
        setSimError('Future Age must be greater than Current Age.');
      }
      return;
    }

    setSimLoading(true);
    setSimError('');
    setSimData(null);
    setSimFutureYear(null);

    const trajectoryLabel = TRAJECTORIES.find(t => t.value === simTrajectory)?.label;

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentAge: currentAge,
          futureAge: simAge,
          city: simCity,
          scenario: simScenario,
          trajectory: trajectoryLabel,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate simulation. Please check API keys.');
      const json = await res.json();
      setSimData(json.data);
      setSimFutureYear(json.futureYear);
    } catch (err: any) {
      setSimError(err.message || 'Something went wrong.');
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full relative bg-[var(--color-bg-base)]">
      {/* Menu Button */}
      <button 
        onClick={() => setIsMenuOpen(true)}
        className="fixed top-6 left-6 z-40 p-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all text-[var(--color-text-secondary)] hover:text-white flex items-center justify-center transform hover:scale-105 active:scale-95"
        aria-label="Open Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-72 md:w-80 bg-[var(--color-bg-card)] border-r border-[var(--color-border)] z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 md:p-8 flex flex-col h-full">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold text-white tracking-tight">Modes</h2>
            <button onClick={() => setIsMenuOpen(false)} className="text-[var(--color-text-muted)] hover:text-white p-2 bg-[var(--color-bg-input)] rounded-xl transition-all transform hover:scale-105 active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            <button
              onClick={() => { setActiveTab('current'); setIsMenuOpen(false); }}
              className={`w-full text-left px-5 py-4 rounded-xl font-medium transition-all flex items-center justify-between gap-2 group ${
                activeTab === 'current' 
                  ? 'bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent)]/20 border border-[var(--color-accent)]/30' 
                  : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-input)] border border-transparent hover:border-[var(--color-border)]'
              }`}
            >
              <span className="text-[1.05rem]">Current Focus</span>
              <span className={`text-xl transition-transform ${activeTab === 'current' ? 'scale-110' : 'group-hover:scale-110 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>🌍</span>
            </button>
            <button
              onClick={() => { setActiveTab('future'); setIsMenuOpen(false); }}
              className={`w-full text-left px-5 py-4 rounded-xl font-medium transition-all flex items-center justify-between gap-2 group ${
                activeTab === 'future' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20 border border-purple-500/30' 
                  : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-input)] border border-transparent hover:border-[var(--color-border)]'
              }`}
            >
              <span className="text-[1.05rem]">Future Simulator</span>
              <span className={`text-xl transition-transform ${activeTab === 'future' ? 'scale-110' : 'group-hover:scale-110 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>🔮</span>
            </button>
            <button
              onClick={() => { setActiveTab('chat'); setIsMenuOpen(false); }}
              className={`w-full text-left px-5 py-4 rounded-xl font-medium transition-all flex items-center justify-between gap-2 group ${
                activeTab === 'chat' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 border border-emerald-500/30' 
                  : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-input)] border border-transparent hover:border-[var(--color-border)]'
              }`}
            >
              <span className="text-[1.05rem]">Eco-Assistant</span>
              <span className={`text-xl transition-transform ${activeTab === 'chat' ? 'scale-110' : 'group-hover:scale-110 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>💬</span>
            </button>
          </div>
          
          <div className="pt-6 border-t border-[var(--color-border)] text-center text-sm text-[var(--color-text-muted)]">
            What's Happening Around Me?
          </div>
        </div>
      </div>

      <div className="flex-1 w-full p-6 pt-24 md:p-12 max-w-4xl mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-10 animate-fade-in relative z-10 hidden md:block">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            What's Happening <span className="text-[var(--color-accent)]">Around Me?</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto">
            Understand local environmental conditions with simple, AI-powered explanations.
          </p>
        </header>

        <header className="w-full text-center mb-10 animate-fade-in relative z-10 md:hidden pt-8">
          <h1 className="text-3xl font-extrabold mb-3 tracking-tight">
            What's Happening <br /><span className="text-[var(--color-accent)]">Around Me?</span>
          </h1>
        </header>

      {/* --- CURRENT TAB --- */}
      {activeTab === 'current' && (
        <div className="w-full animate-fade-in">
          <div className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
            <form onSubmit={handleCurrentSubmit} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-[var(--color-text-muted)]">Where are you?</label>
                  <button 
                    type="button" 
                    onClick={handleLocateMe}
                    disabled={isLocating}
                    className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] flex items-center gap-1 transition-colors disabled:opacity-50"
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
                  type="text"
                  placeholder="e.g. New York, London, Tokyo..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
                  required
                />
              </div>
              
              <div className="flex-1 md:max-w-[250px]">
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Top Concern</label>
                <select
                  value={concern}
                  onChange={(e) => setConcern(e.target.value)}
                  className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all cursor-pointer"
                >
                  {CONCERNS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || !location.trim()}
                  className="w-full md:w-auto bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold py-3 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-[48px]"
                >
                  {loading ? 'Checking...' : 'Explain It'}
                </button>
              </div>
            </form>
          </div>

          {error && <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 text-center">{error}</div>}
          
          {loading && !envData && (
            <div className="w-full space-y-4"><div className="h-24 rounded-xl loading-shimmer"></div><div className="h-32 rounded-xl loading-shimmer"></div></div>
          )}

          {envData && explanation && (
            <div className="w-full space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 rounded-xl text-center">
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Temp</p>
                  <p className="text-2xl font-bold text-white">{Math.round(envData.temperature)}°C</p>
                </div>
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 rounded-xl text-center">
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">AQI</p>
                  <p className="text-2xl font-bold text-white">{envData.aqi}</p>
                </div>
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 rounded-xl text-center">
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Humidity</p>
                  <p className="text-2xl font-bold text-white">{envData.humidity}%</p>
                </div>
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 rounded-xl text-center">
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Wind</p>
                  <p className="text-2xl font-bold text-white">{envData.windSpeed}m/s</p>
                </div>
              </div>

              <div className="bg-[var(--color-info-bg)] border border-[var(--color-accent)]/30 p-6 md:p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-accent)]"></div>
                <div className="flex items-start gap-4">
                  <div className="bg-[var(--color-accent)] text-white p-2 rounded-lg mt-1 shrink-0">💡</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Here's the deal with {concern.toLowerCase()} today:</h3>
                    <p className="text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">{explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- CHAT TAB --- */}
      {activeTab === 'chat' && (
        <div className="w-full h-[70vh] flex flex-col bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl animate-fade-in overflow-hidden mb-8">
          <div className="bg-emerald-600/10 border-b border-[var(--color-border)] p-4 md:px-6 shrink-0 flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <h2 className="text-white font-bold tracking-tight">Eco-Assistant</h2>
              <p className="text-emerald-400 text-xs font-medium">Powered by AI</p>
            </div>
            {envData && (
              <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-500/30 hidden sm:block">
                Context: {envData.location}
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-black/20 custom-scrollbar">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-sm shadow-md' 
                    : 'bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-tl-sm shadow-sm'
                }`}>
                  {msg.role === 'assistant' && <div className="text-xs text-[var(--color-text-muted)] font-semibold mb-1 uppercase tracking-wider">Assistant</div>}
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-2xl rounded-tl-sm p-4 shadow-sm flex gap-2 items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-[var(--color-bg-card)] border-t border-[var(--color-border)] shrink-0">
            {chatError && <div className="text-red-400 text-sm mb-2 text-center">{chatError}</div>}
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder={isChatLoading ? "Assistant is typing..." : "Ask about climate, weather, environmental data..."}
                disabled={isChatLoading}
                className="flex-1 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={isChatLoading || !chatInput.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- FUTURE TAB --- */}
      {activeTab === 'future' && (
        <div className="w-full animate-fade-in">
          <div className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
            <form onSubmit={handleSimulateSubmit} className="flex flex-col gap-6">
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 md:max-w-[120px]">
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Current Age</label>
                  <input
                    type="number"
                    min="1" max="120"
                    placeholder="e.g. 15"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(e.target.valueAsNumber || '')}
                    className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    required
                  />
                </div>

                <div className="flex-1 md:max-w-[120px]">
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Future Age</label>
                  <input
                    type="number"
                    min="1" max="120"
                    placeholder="e.g. 45"
                    value={simAge}
                    onChange={(e) => setSimAge(e.target.valueAsNumber || '')}
                    className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    required
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Miami, Mumbai..."
                    value={simCity}
                    onChange={(e) => setSimCity(e.target.value)}
                    className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    required
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Scenario</label>
                  <select
                    value={simScenario}
                    onChange={(e) => setSimScenario(e.target.value)}
                    className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all cursor-pointer"
                  >
                    {SCENARIOS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Slider Section */}
              <div className="pt-4 border-t border-[var(--color-border)]">
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-4">World Trajectory Twist</label>
                
                <div className="relative w-full px-2 mb-8">
                  <input 
                    type="range" 
                    min="1" max="3" step="1"
                    value={simTrajectory}
                    onChange={(e) => setSimTrajectory(parseInt(e.target.value))}
                    className="w-full h-2 bg-[var(--color-bg-input)] rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-xs font-medium text-[var(--color-text-muted)] mt-3 px-1">
                    <span className={simTrajectory === 1 ? 'text-green-400' : ''}>Cleaner Future</span>
                    <span className={simTrajectory === 2 ? 'text-yellow-400' : ''}>Current Path</span>
                    <span className={simTrajectory === 3 ? 'text-red-400' : ''}>+2°C World</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-2">
                <button
                  type="submit"
                  disabled={simLoading || !simCity.trim() || !simAge || !currentAge || simAge <= currentAge}
                  className="w-full md:w-auto bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-10 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {simLoading ? 'Simulating...' : 'Glimpse the Future'}
                </button>
              </div>
            </form>
          </div>

          {simError && <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 text-center">{simError}</div>}
          
          {simLoading && !simData && (
            <div className="w-full space-y-4"><div className="h-24 rounded-xl loading-shimmer"></div><div className="h-40 rounded-xl loading-shimmer"></div></div>
          )}

          {simData && (
            <div className="space-y-6 animate-fade-in mt-6">
              <div className="bg-purple-900/10 border border-purple-500/30 p-6 md:p-8 rounded-2xl relative overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.1)]">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                <div className="flex items-start gap-4">
                  <div className="bg-purple-500 text-white p-2 rounded-lg shrink-0">🔮</div>
                  <div className="w-full">
                    <h3 className="text-xl font-bold text-white mb-3">Life in {simFutureYear} (At Age {simAge})</h3>
                    <p className="text-purple-100/90 leading-relaxed text-lg whitespace-pre-wrap">{simData.story}</p>
                  </div>
                </div>
              </div>

              {simData.metrics && simData.metrics.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {simData.metrics.map((metric, idx) => (
                    <div key={idx} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/5">
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
      )}

      </div>
    </main>
  );
}
