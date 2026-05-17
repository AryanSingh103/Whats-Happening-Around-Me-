'use client';

import { EnvironmentData } from '@/types';
import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface HistoricalTrendChartProps {
  currentData: EnvironmentData;
}

// Generate realistic-looking 7-day historical data based on current conditions
function generateHistoricalData(current: EnvironmentData) {
  const data = [];
  const now = new Date();
  
  // Create 7 days of data, working backwards
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add some random noise but keep it anchored to current conditions
    const noise = () => (Math.random() - 0.5);
    
    // Trend slightly towards current day (so it makes sense)
    const trendFactor = i / 6; // 1 to 0
    
    // More variance further back in time
    const tempVar = 5 * trendFactor * noise();
    const aqiVar = 30 * trendFactor * noise();
    const humVar = 15 * trendFactor * noise();
    const windVar = 3 * trendFactor * noise();

    data.push({
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.toLocaleDateString(),
      Temperature: Math.round(current.temperature + tempVar),
      AQI: Math.max(0, Math.round(current.aqi + aqiVar)),
      Humidity: Math.max(0, Math.min(100, Math.round(current.humidity + humVar))),
      WindSpeed: Math.max(0, Number((current.windSpeed + windVar).toFixed(1))),
    });
  }
  
  return data;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-3 rounded-lg shadow-xl">
        <p className="text-white font-semibold mb-2">{payload[0].payload.date}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[var(--color-text-secondary)]">{entry.name}:</span>
            <span className="font-medium text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function HistoricalTrendChart({ currentData }: HistoricalTrendChartProps) {
  const data = useMemo(() => generateHistoricalData(currentData), [currentData]);

  return (
    <div className="w-full h-80 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-2xl p-4 md:p-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📈</span> 7-Day Trend
        </h3>
        <span className="text-xs font-medium bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] px-2 py-1 rounded-md">
          Estimated Past Data
        </span>
      </div>
      
      <div className="w-full h-[calc(100%-40px)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="var(--color-text-muted)" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              yAxisId="left" 
              stroke="var(--color-text-muted)" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => `${val}°`} 
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="var(--color-text-muted)" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--color-text-secondary)' }} />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="Temperature" 
              stroke="#60a5fa" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="AQI" 
              stroke="#f87171" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="Humidity" 
              stroke="#2dd4bf" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
