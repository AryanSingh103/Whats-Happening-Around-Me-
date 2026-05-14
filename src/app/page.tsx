'use client';

import { useState } from 'react';
import { ActiveTab } from '@/types';
import { Sidebar } from '@/components/layout/Sidebar';
import { CurrentFocusPanel } from '@/components/current/CurrentFocusPanel';
import { FutureSimulatorPanel } from '@/components/simulator/FutureSimulatorPanel';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { useTheme } from '@/hooks/useTheme';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('current');
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="flex min-h-screen w-full relative bg-[var(--color-bg-base)]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} toggleTheme={toggleTheme} />

      {/* Main Content — offset by sidebar width on desktop */}
      <div className="flex-1 w-full md:ml-[260px] p-6 pt-8 md:p-12 max-w-4xl mx-auto flex flex-col items-center pb-28 md:pb-12">
        {/* Desktop Header */}
        <header className="w-full text-center mb-10 animate-fade-in relative z-10 hidden md:block">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            {activeTab === 'current' && (
              <>What&apos;s Happening <span className="text-[var(--color-accent)]">Around Me?</span></>
            )}
            {activeTab === 'future' && (
              <>Future <span className="text-purple-400">Simulator</span></>
            )}
            {activeTab === 'chat' && (
              <>Eco-<span className="text-emerald-400">Assistant</span></>
            )}
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto">
            {activeTab === 'current' && 'Understand local environmental conditions with simple, AI-powered explanations.'}
            {activeTab === 'future' && 'See what daily life could feel like decades from now under different climate scenarios.'}
            {activeTab === 'chat' && 'Ask questions about climate, weather, and environmental science.'}
          </p>
        </header>

        {/* Mobile Header */}
        <header className="w-full text-center mb-8 animate-fade-in relative z-10 md:hidden">
          <h1 className="text-2xl font-extrabold tracking-tight">
            {activeTab === 'current' && (
              <>What&apos;s Happening <span className="text-[var(--color-accent)]">Around Me?</span></>
            )}
            {activeTab === 'future' && (
              <>Future <span className="text-purple-400">Simulator</span></>
            )}
            {activeTab === 'chat' && (
              <>Eco-<span className="text-emerald-400">Assistant</span></>
            )}
          </h1>
        </header>

        {/* Tab Panels */}
        {activeTab === 'current' && <CurrentFocusPanel envData={null} />}
        {activeTab === 'future' && <FutureSimulatorPanel />}
        {activeTab === 'chat' && <ChatPanel />}
      </div>
    </main>
  );
}
