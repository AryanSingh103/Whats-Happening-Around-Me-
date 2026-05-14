'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/types';
import { fetchChatResponse } from '@/lib/api';

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    "Hi there! I'm your Eco-Assistant. Ask me anything about climate science, local weather patterns, or environmental data!",
};

export function useChat(contextData?: any) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      const userMsg = input.trim();
      setInput('');
      setError('');
      setIsLoading(true);

      const newMessages: ChatMessage[] = [
        ...messages,
        { role: 'user', content: userMsg },
      ];
      setMessages(newMessages);

      try {
        const data = await fetchChatResponse(
          newMessages.map((m) => ({ role: m.role, content: m.content })),
          contextData
        );
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.response },
        ]);
      } catch (err: any) {
        setError(
          err.message || 'Something went wrong connecting to the AI.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, contextData]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      setError('');
      setIsLoading(true);

      const newMessages: ChatMessage[] = [
        ...messages,
        { role: 'user', content: text },
      ];
      setMessages(newMessages);

      try {
        const data = await fetchChatResponse(
          newMessages.map((m) => ({ role: m.role, content: m.content })),
          contextData
        );
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.response },
        ]);
      } catch (err: any) {
        setError(
          err.message || 'Something went wrong connecting to the AI.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, contextData]
  );

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    messagesEndRef,
    handleSubmit,
    sendMessage,
  };
}
