'use client';

import { useChat } from '@/hooks/useChat';
import { CHAT_STARTER_QUESTIONS } from '@/lib/constants';
import { EnvironmentData } from '@/types';

interface ChatPanelProps {
  envData?: EnvironmentData | null;
  location?: string;
}

export function ChatPanel({ envData, location }: ChatPanelProps) {
  const chat = useChat(envData);

  return (
    <div className="w-full h-[calc(100vh-180px)] md:h-[75vh] flex flex-col bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl animate-fade-in overflow-hidden mb-20 md:mb-8">
      {/* Header */}
      <div className="bg-emerald-600/10 border-b border-[var(--color-border)] p-4 md:px-6 shrink-0 flex items-center gap-3">
        <span className="text-2xl">💬</span>
        <div>
          <h2 className="text-white font-bold tracking-tight">Eco-Assistant</h2>
          <p className="text-emerald-400 text-xs font-medium">Powered by AI</p>
        </div>
        {envData && location && (
          <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-500/30 hidden sm:block">
            Context: {location}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-black/20 custom-scrollbar">
        {chat.messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 ${
              msg.role === 'user'
                ? 'bg-emerald-600 text-white rounded-tr-sm shadow-md'
                : 'bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-tl-sm shadow-sm'
            }`}>
              {msg.role === 'assistant' && (
                <div className="text-xs text-[var(--color-text-muted)] font-semibold mb-1 uppercase tracking-wider">Assistant</div>
              )}
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
            </div>
          </div>
        ))}

        {/* Starter Questions (only when just the initial message exists) */}
        {chat.messages.length === 1 && !chat.isLoading && (
          <div className="flex flex-wrap gap-2 pt-2 animate-fade-in">
            {CHAT_STARTER_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => chat.sendMessage(q)}
                className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-sm text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {chat.isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-2xl rounded-tl-sm p-4 shadow-sm flex gap-2 items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={chat.messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-[var(--color-bg-card)] border-t border-[var(--color-border)] shrink-0">
        {chat.error && <div className="text-red-400 text-sm mb-2 text-center">{chat.error}</div>}
        <form onSubmit={chat.handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={chat.input}
            onChange={(e) => chat.setInput(e.target.value)}
            placeholder={chat.isLoading ? 'Assistant is typing...' : 'Ask about climate, weather, environmental data...'}
            disabled={chat.isLoading}
            className="flex-1 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-50"
            aria-label="Chat message input"
          />
          <button
            type="submit"
            disabled={chat.isLoading || !chat.input.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]"
            aria-label="Send message"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
