'use client';

import { ActiveTab } from '@/types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  historyCount?: number;
  onOpenHistory: () => void;
}

const TABS: { id: ActiveTab; label: string; emoji: string; activeClass: string }[] = [
  {
    id: 'current',
    label: 'Current Focus',
    emoji: '🌍',
    activeClass: 'bg-[var(--color-accent)]/90 backdrop-blur-md text-white shadow-[0_0_20px_var(--color-accent)] shadow-[var(--color-accent)]/40 border-[var(--color-accent)]/50',
  },
  {
    id: 'compare',
    label: 'Compare Locations',
    emoji: '⚖️',
    activeClass: 'bg-blue-600/90 backdrop-blur-md text-white shadow-[0_0_20px_rgba(37,99,235,0.8)] shadow-blue-500/40 border-blue-500/50',
  },
  {
    id: 'future',
    label: 'Future Simulator',
    emoji: '🔮',
    activeClass: 'bg-purple-600/90 backdrop-blur-md text-white shadow-[0_0_20px_rgba(147,51,234,0.8)] shadow-purple-500/40 border-purple-500/50',
  },
  {
    id: 'chat',
    label: 'Eco-Assistant',
    emoji: '💬',
    activeClass: 'bg-emerald-600/90 backdrop-blur-md text-white shadow-[0_0_20px_rgba(5,150,105,0.8)] shadow-emerald-500/40 border-emerald-500/50',
  },
];

export function Sidebar({ activeTab, setActiveTab, theme, toggleTheme, historyCount = 0, onOpenHistory }: SidebarProps) {
  return (
    <>
      {/* ── Desktop Sidebar (always visible) ── */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-[260px] bg-[var(--color-bg-card)] backdrop-blur-2xl border-r border-[var(--color-border)] z-30 flex-col shadow-[4px_0_24px_rgba(0,0,0,0.15)]">
        <div className="p-6 flex flex-col h-full">
          {/* Branding */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
              What's Happening<br />
              <span className="text-[var(--color-accent)]">Around Me?</span>
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-1.5">AI-Powered Environmental Insights</p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2 flex-1">
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 px-2">Modes</p>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3.5 rounded-xl font-medium transition-all flex items-center justify-between gap-2 group border ${
                  activeTab === tab.id
                    ? tab.activeClass
                    : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-input)] border-transparent hover:border-[var(--color-border)]'
                }`}
              >
                <span className="text-[0.95rem]">{tab.label}</span>
                <span
                  className={`text-lg transition-transform ${
                    activeTab === tab.id
                      ? 'scale-110'
                      : 'group-hover:scale-110 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'
                  }`}
                >
                  {tab.emoji}
                </span>
              </button>
            ))}
          </nav>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-between gap-2 text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-input)] border border-transparent hover:border-[var(--color-border)] mt-2"
          >
            <span className="text-[0.95rem] flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              History
            </span>
            {historyCount > 0 && (
              <span className="text-xs bg-[var(--color-accent)]/20 text-[var(--color-accent)] px-2 py-0.5 rounded-full font-semibold">
                {historyCount}
              </span>
            )}
          </button>

          {/* Footer */}
          <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-muted)]">Powered by OpenAI</span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] active:scale-95"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-bg-card)] backdrop-blur-2xl border-t border-[var(--color-border)] z-40 safe-area-bottom shadow-[0_-4px_24px_rgba(0,0,0,0.15)]">
        <div className="flex items-stretch">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              <span className={`text-xl ${activeTab === tab.id ? '' : 'grayscale opacity-60'}`}>
                {tab.emoji}
              </span>
              <span className={`text-[0.65rem] font-semibold uppercase tracking-wider ${
                activeTab === tab.id ? 'text-[var(--color-accent)]' : ''
              }`}>
                {tab.label.split(' ')[0]}
              </span>
              {activeTab === tab.id && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[var(--color-accent)] rounded-full" />
              )}
            </button>
          ))}
          <button
            onClick={toggleTheme}
            className="flex flex-col items-center justify-center py-3 px-3 gap-1 text-[var(--color-text-muted)] transition-all"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider">Theme</span>
          </button>
        </div>
      </nav>
    </>
  );
}
