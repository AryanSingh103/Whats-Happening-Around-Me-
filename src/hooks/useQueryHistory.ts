'use client';

import { useState, useCallback, useEffect } from 'react';

export interface QueryEntry {
  id: string;
  query: string;
  contextLocation?: string;
  timestamp: number;
}

const STORAGE_KEY = 'wham_query_history';

function loadQueries(): QueryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueries(entries: QueryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or unavailable
  }
}

export function useQueryHistory() {
  const [queries, setQueries] = useState<QueryEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setQueries(loadQueries());
    setMounted(true);
  }, []);

  const addQuery = useCallback((query: string, contextLocation?: string) => {
    setQueries((prev) => {
      const entry: QueryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        query,
        contextLocation,
        timestamp: Date.now(),
      };
      const updated = [entry, ...prev];
      saveQueries(updated);
      return updated;
    });
  }, []);

  const removeQuery = useCallback((id: string) => {
    setQueries((prev) => {
      const updated = prev.filter((q) => q.id !== id);
      saveQueries(updated);
      return updated;
    });
  }, []);

  const clearQueries = useCallback(() => {
    setQueries([]);
    saveQueries([]);
  }, []);

  const downloadQueriesCsv = useCallback(() => {
    if (queries.length === 0) return;

    // Create CSV header
    let csvContent = 'ID,Timestamp,Query,Context Location\n';

    // Add rows
    queries.forEach((q) => {
      const date = new Date(q.timestamp).toISOString();
      const escapedQuery = q.query.replace(/"/g, '""'); // Escape quotes
      const location = q.contextLocation ? q.contextLocation.replace(/"/g, '""') : 'None';
      
      csvContent += `"${q.id}","${date}","${escapedQuery}","${location}"\n`;
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `eco_assistant_queries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [queries]);

  return {
    queries,
    mounted,
    addQuery,
    removeQuery,
    clearQueries,
    downloadQueriesCsv,
  };
}
