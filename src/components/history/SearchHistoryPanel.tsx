'use client';

import { SearchEntry } from '@/hooks/useSearchHistory';

interface SearchHistoryPanelProps {
  history: SearchEntry[];
  onSelect: (entry: SearchEntry) => void;
  onTogglePin: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

function formatTimestamp(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function getAqiBadge(aqi: number): { text: string; class: string } {
  if (aqi <= 50) return { text: 'Good', class: 'bg-green-500/20 text-green-300 border-green-500/30' };
  if (aqi <= 100) return { text: 'Moderate', class: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
  if (aqi <= 150) return { text: 'Unhealthy', class: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
  return { text: 'Hazardous', class: 'bg-red-500/20 text-red-300 border-red-500/30' };
}

export function SearchHistoryPanel({
  history,
  onSelect,
  onTogglePin,
  onRemove,
  onClear,
  isOpen,
  onClose,
}: SearchHistoryPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
        style={{ animationDuration: '0.2s' }}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--color-bg-card)] backdrop-blur-3xl border-l border-[var(--color-border)] z-50 shadow-[-10px_0_40px_rgba(0,0,0,0.2)] flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-5 border-b border-[var(--color-border)] bg-[var(--color-bg-card)]/30 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📋</span> Search History
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {history.length} {history.length === 1 ? 'search' : 'searches'} saved
            </p>
          </div>
          <div className="flex items-center gap-2">
            {history.some((e) => !e.pinned) && (
              <button
                onClick={onClear}
                className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10 transition-all"
                aria-label="Clear unpinned history"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--color-bg-input)] text-[var(--color-text-muted)] hover:text-white transition-all"
              aria-label="Close history panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-base font-semibold text-white mb-1">No searches yet</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Your search history will appear here. Pin favorites for quick access.
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-1.5">
              {history.map((entry) => {
                const aqiBadge = getAqiBadge(entry.data.aqi);
                return (
                  <div
                    key={entry.id}
                    className={`group relative rounded-xl border transition-all cursor-pointer hover:shadow-lg ${
                      entry.pinned
                        ? 'bg-[var(--color-accent)]/10 backdrop-blur-md border-[var(--color-accent)]/30 hover:border-[var(--color-accent)]/50'
                        : 'bg-[var(--color-bg-input)]/80 backdrop-blur-md border-[var(--color-border)] hover:border-[var(--color-accent)]/40 hover:shadow-[0_0_15px_var(--color-accent)] hover:shadow-[var(--color-accent)]/10'
                    }`}
                  >
                    <div
                      className="p-3.5"
                      onClick={() => onSelect(entry)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {entry.pinned && <span className="text-xs shrink-0">📌</span>}
                          <h4 className="font-semibold text-white text-sm truncate">
                            {entry.location}
                          </h4>
                        </div>
                        <span className="text-[0.65rem] text-[var(--color-text-muted)] whitespace-nowrap shrink-0">
                          {formatTimestamp(entry.timestamp)}
                        </span>
                      </div>

                      {/* Quick metrics */}
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[var(--color-text-secondary)]">
                          {Math.round(entry.data.temperature)}°C
                        </span>
                        <span className={`px-1.5 py-0.5 rounded border text-[0.65rem] font-medium ${aqiBadge.class}`}>
                          AQI {entry.data.aqi}
                        </span>
                        <span className="text-[var(--color-text-muted)]">
                          {entry.data.humidity}% 💧
                        </span>
                      </div>
                    </div>

                    {/* Action buttons — show on hover */}
                    <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin(entry.id);
                        }}
                        className="p-1.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-all text-xs"
                        aria-label={entry.pinned ? 'Unpin' : 'Pin'}
                        title={entry.pinned ? 'Unpin' : 'Pin to favorites'}
                      >
                        {entry.pinned ? '📌' : '📍'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(entry.id);
                        }}
                        className="p-1.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-red-500/50 text-[var(--color-text-muted)] hover:text-red-400 transition-all text-xs"
                        aria-label="Remove from history"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
