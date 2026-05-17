// ── Shared Type Definitions ──

export interface EnvironmentData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  aqi: number;
  aqiLabel: string;
  description: string;
  isDummy?: boolean;
  lat?: number;
  lon?: number;
}

export interface SimMetric {
  name: string;
  value: string;
  context: string;
  trend: 'bad' | 'good' | 'neutral';
}

export interface SimData {
  story: string;
  metrics: SimMetric[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type ActiveTab = 'current' | 'compare' | 'future' | 'chat';

export interface Trajectory {
  value: number;
  label: string;
}
