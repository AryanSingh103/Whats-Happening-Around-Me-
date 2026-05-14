'use client';

import { ActiveTab } from '@/types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const TABS: { id: ActiveTab; label: string; emoji: string; activeClass: string }[] = [
  {
    id: 'current',
    label: 'Current Focus',
    emoji: '🌍',
    activeClass: 'bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent)]/20 border-[var(--color-accent)]/30',
  },
  {
    id: 'future',
    label: 'Future Simulator',
    emoji: '🔮',
    activeClass: 'bg-purple-600 text-white shadow-lg shadow-purple-500/20 border-purple-500/30',
  },
  {
    id: 'chat',
    label: 'Eco-Assistant',
    emoji: '💬',
    activeClass: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 border-emerald-500/30',
  },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <>
      {/* ── Desktop Sidebar (always visible) ── */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-[260px] bg-[var(--color-bg-card)] border-r border-[var(--color-border)] z-30 flex-col shadow-xl">
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

          {/* Footer */}
          <div className="pt-4 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
            Powered by OpenAI & OpenWeather
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-bg-card)]/95 backdrop-blur-xl border-t border-[var(--color-border)] z-40 safe-area-bottom">
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
        </div>
      </nav>
    </>
  );
}
