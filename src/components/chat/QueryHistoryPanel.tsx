'use client';

import { QueryEntry } from '@/hooks/useQueryHistory';

interface QueryHistoryPanelProps {
  queries: QueryEntry[];
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  onDownload: () => void;
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

export function QueryHistoryPanel({
  queries,
  isOpen,
  onClose,
  onClear,
  onDownload,
}: QueryHistoryPanelProps) {
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
              <span>🗄️</span> Query History
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {queries.length} {queries.length === 1 ? 'query' : 'queries'} saved
            </p>
          </div>
          <div className="flex items-center gap-2">
            {queries.length > 0 && (
              <button
                onClick={onDownload}
                className="text-xs bg-emerald-500/10 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-1"
                aria-label="Download as CSV"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                CSV
              </button>
            )}
            {queries.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10 transition-all"
                aria-label="Clear queries"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--color-bg-input)] text-[var(--color-text-muted)] hover:text-white transition-all"
              aria-label="Close query history panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {queries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-base font-semibold text-white mb-1">No queries yet</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Ask the Eco-Assistant questions and they will appear here. You can download them later for research data.
              </p>
            </div>
          ) : (
            queries.map((entry) => (
              <div
                key={entry.id}
                className="group relative rounded-xl border bg-[var(--color-bg-input)]/80 backdrop-blur-md border-[var(--color-border)] p-3.5 transition-all hover:border-[var(--color-accent)]/40 hover:shadow-[0_0_15px_var(--color-accent)] hover:shadow-[var(--color-accent)]/10"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--color-text-primary)] text-sm whitespace-pre-wrap break-words">
                      "{entry.query}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[0.65rem] text-[var(--color-text-muted)]">
                  <span>{formatTimestamp(entry.timestamp)}</span>
                  {entry.contextLocation && (
                    <span className="bg-[var(--color-bg-card)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">
                      📍 {entry.contextLocation}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
