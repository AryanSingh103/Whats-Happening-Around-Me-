'use client';

import { useChat as useAIChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant' as const,
  content:
    "Hi there! I'm your Eco-Assistant. Ask me anything about climate science, local weather patterns, or environmental data!",
  parts: [
    {
      type: 'text' as const,
      text: "Hi there! I'm your Eco-Assistant. Ask me anything about climate science, local weather patterns, or environmental data!",
    },
  ],
  createdAt: new Date(),
};

import { useQueryHistory } from './useQueryHistory';

export function useChat(contextData?: any, locationContext?: string) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: contextData ? { contextData } : undefined,
      }),
    [contextData]
  );

  const {
    messages,
    sendMessage,
    status,
    error,
    stop,
  } = useAIChat({
    messages: [WELCOME_MESSAGE],
    transport,
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const isLoading = status === 'submitted' || status === 'streaming';
  const isStreaming = status === 'streaming';

  const { addQuery } = useQueryHistory();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      sendMessage({ text: input });
      addQuery(input, locationContext);
      setInput('');
    },
    [input, isLoading, sendMessage, addQuery, locationContext]
  );

  const handleSendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || isLoading) return;
      sendMessage({ text });
      addQuery(text, locationContext);
    },
    [isLoading, sendMessage, addQuery, locationContext]
  );

  return {
    messages,
    input,
    setInput,
    isLoading,
    isStreaming,
    error: error?.message || '',
    messagesEndRef,
    handleSubmit,
    sendMessage: handleSendMessage,
    stop,
  };
}
