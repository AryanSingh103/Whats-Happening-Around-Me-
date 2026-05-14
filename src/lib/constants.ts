import { Trajectory } from '@/types';

export const CONCERNS = [
  'Air Pollution',
  'Heat Wave',
  'UV Exposure',
  'Flooding',
  'Wildfire Smoke',
];

export const SCENARIOS = [
  'Extreme Heat Waves',
  'Rising Sea Levels',
  'Worsening Air Pollution',
  'Increasing Wildfires',
  'Severe Storms',
];

export const TRAJECTORIES: Trajectory[] = [
  { value: 1, label: 'Cleaner Future' },
  { value: 2, label: 'Current Path' },
  { value: 3, label: 'Extreme Reality' },
];

export const QUICK_CITIES = [
  'New York',
  'London',
  'Tokyo',
  'Mumbai',
  'São Paulo',
  'Lagos',
];

export const CHAT_STARTER_QUESTIONS = [
  'What does AQI actually mean?',
  'Why is my city so hot today?',
  'How does humidity affect health?',
  'What causes wildfires?',
];
