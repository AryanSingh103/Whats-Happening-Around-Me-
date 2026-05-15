'use client';

import { useChat } from '@/hooks/useChat';
import { CHAT_STARTER_QUESTIONS } from '@/lib/constants';
import { EnvironmentData } from '@/types';
import { exportChat } from '@/lib/export';
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';

interface ChatPanelProps {
  envData?: EnvironmentData | null;
  location?: string;
}

function getMessageText(msg: any): string {
  // AI SDK v6 uses parts array
  if (msg.parts && Array.isArray(msg.parts)) {
    return msg.parts
      .filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
      .join('');
  }
  // Fallback to content
  return msg.content || '';
}

const FOLLOW_UP_SUGGESTIONS: Record<string, string[]> = {
  aqi: [
    'How can I protect myself from poor air quality?',
    'What causes AQI to spike?',
    'Compare indoor vs outdoor air quality',
  ],
  temperature: [
    'What are the health effects of extreme heat?',
    'How do cities make heat waves worse?',
    'What\'s the urban heat island effect?',
  ],
  general: [
    'How does climate change affect my area?',
    'What can I do to reduce my environmental impact?',
    'Explain the greenhouse effect simply',
  ],
};

function getFollowUps(messages: any[]): string[] {
  if (messages.length < 2) return [];

  // Look at the last few messages for topic hints
  const recentTexts = messages
    .slice(-3)
    .map((m: any) => getMessageText(m).toLowerCase())
    .join(' ');

  if (recentTexts.includes('aqi') || recentTexts.includes('air quality') || recentTexts.includes('pollution')) {
    return FOLLOW_UP_SUGGESTIONS.aqi;
  }
  if (recentTexts.includes('temperature') || recentTexts.includes('heat') || recentTexts.includes('hot')) {
    return FOLLOW_UP_SUGGESTIONS.temperature;
  }
  return FOLLOW_UP_SUGGESTIONS.general;
}

export function ChatPanel({ envData, location }: ChatPanelProps) {
  const chat = useChat(envData);
  const [followUps, setFollowUps] = useState<string[]>([]);

  // Update follow-ups when messages change and we're not loading
  useEffect(() => {
    if (!chat.isLoading && chat.messages.length > 1) {
      setFollowUps(getFollowUps(chat.messages));
    } else {
      setFollowUps([]);
    }
  }, [chat.messages, chat.isLoading]);

  return (
    <div className="w-full h-[calc(100vh-180px)] md:h-[75vh] flex flex-col bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl animate-fade-in overflow-hidden mb-20 md:mb-8">
      {/* Header */}
      <div className="bg-emerald-600/10 border-b border-[var(--color-border)] p-4 md:px-6 shrink-0 flex items-center gap-3">
        <span className="text-2xl">💬</span>
        <div>
          <h2 className="text-white font-bold tracking-tight">Eco-Assistant</h2>
          <p className="text-emerald-400 text-xs font-medium">
            {chat.isStreaming ? '● Streaming...' : 'Powered by AI'}
          </p>
        </div>
        {envData && location && (
          <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-500/30 hidden sm:block">
            Context: {location}
          </span>
        )}
        {chat.isLoading && (
          <button
            onClick={chat.stop}
            className="ml-auto text-xs bg-red-500/20 text-red-300 px-3 py-1.5 rounded-full border border-red-500/30 hover:bg-red-500/30 transition-colors"
            aria-label="Stop generating"
          >
            ■ Stop
          </button>
        )}
        {!chat.isLoading && chat.messages.length > 1 && (
          <button
            onClick={() => exportChat(chat.messages as any)}
            className="ml-auto text-xs bg-emerald-500/10 text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
            aria-label="Export chat"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-black/20 custom-scrollbar">
        {chat.messages.map((msg, i) => {
          const text = getMessageText(msg);
          if (!text) return null;
          const role = msg.role as string;

          return (
            <div key={msg.id || i} className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 ${
                role === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-sm shadow-md'
                  : 'bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-tl-sm shadow-sm'
              }`}>
                {role === 'assistant' && (
                  <div className="text-xs text-[var(--color-text-muted)] font-semibold mb-1 uppercase tracking-wider">Assistant</div>
                )}
                {role === 'assistant' ? (
                  <div className="prose-chat leading-relaxed">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                        em: ({ children }) => <em className="italic text-emerald-300">{children}</em>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-[var(--color-text-primary)]">{children}</li>,
                        code: ({ children }) => (
                          <code className="bg-black/30 px-1.5 py-0.5 rounded text-xs font-mono text-emerald-300">{children}</code>
                        ),
                        h1: ({ children }) => <h3 className="text-lg font-bold text-white mb-2 mt-3">{children}</h3>,
                        h2: ({ children }) => <h4 className="text-base font-bold text-white mb-1.5 mt-2">{children}</h4>,
                        h3: ({ children }) => <h5 className="text-sm font-bold text-white mb-1 mt-2">{children}</h5>,
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline hover:text-emerald-300 transition-colors">{children}</a>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-emerald-500/50 pl-3 italic text-[var(--color-text-secondary)] my-2">{children}</blockquote>
                        ),
                      }}
                    >
                      {text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed">{text}</div>
                )}
              </div>
            </div>
          );
        })}

        {/* Starter Questions */}
        {chat.messages.length <= 1 && !chat.isLoading && (
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

        {/* Suggested Follow-ups */}
        {followUps.length > 0 && !chat.isLoading && (
          <div className="animate-fade-in">
            <p className="text-xs text-[var(--color-text-muted)] mb-2 font-semibold uppercase tracking-wider">Suggested follow-ups</p>
            <div className="flex flex-wrap gap-2">
              {followUps.map((q) => (
                <button
                  key={q}
                  onClick={() => chat.sendMessage(q)}
                  className="px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 hover:bg-emerald-500/15 hover:text-emerald-300 hover:border-emerald-500/40 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Thinking indicator (before stream starts) */}
        {chat.isLoading && !chat.isStreaming && (
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
            placeholder={chat.isLoading ? 'Assistant is responding...' : 'Ask about climate, weather, environmental data...'}
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
