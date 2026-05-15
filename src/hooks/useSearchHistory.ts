'use client';

import { useState, useCallback, useEffect } from 'react';
import { EnvironmentData } from '@/types';

export interface SearchEntry {
  id: string;
  location: string;
  concern: string;
  data: EnvironmentData;
  timestamp: number;
  pinned: boolean;
}

const STORAGE_KEY = 'wham_search_history';
const MAX_HISTORY = 20;

function loadHistory(): SearchEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: SearchEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setHistory(loadHistory());
    setMounted(true);
  }, []);

  const addEntry = useCallback(
    (location: string, concern: string, data: EnvironmentData) => {
      setHistory((prev) => {
        // Remove duplicate for same location (keep newest)
        const filtered = prev.filter(
          (e) => e.location.toLowerCase() !== location.toLowerCase()
        );
        const entry: SearchEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          location,
          concern,
          data,
          timestamp: Date.now(),
          pinned: false,
        };
        // Pinned entries stay, non-pinned get trimmed
        const pinned = filtered.filter((e) => e.pinned);
        const unpinned = filtered.filter((e) => !e.pinned);
        const trimmed = unpinned.slice(0, MAX_HISTORY - 1 - pinned.length);
        const updated = [entry, ...pinned, ...trimmed];
        saveHistory(updated);
        return updated;
      });
    },
    []
  );

  const togglePin = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.map((e) =>
        e.id === id ? { ...e, pinned: !e.pinned } : e
      );
      saveHistory(updated);
      return updated;
    });
  }, []);

  const removeEntry = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory((prev) => {
      // Keep pinned entries
      const pinned = prev.filter((e) => e.pinned);
      saveHistory(pinned);
      return pinned;
    });
  }, []);

  // Sort: pinned first, then by timestamp descending
  const sortedHistory = mounted
    ? [...history].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.timestamp - a.timestamp;
      })
    : [];

  const pinnedCount = history.filter((e) => e.pinned).length;

  return {
    history: sortedHistory,
    pinnedCount,
    addEntry,
    togglePin,
    removeEntry,
    clearHistory,
    mounted,
  };
}
