'use client';

import { useState, useCallback } from 'react';
import { EnvironmentData } from '@/types';
import { fetchEnvironmentData, fetchExplanation, fetchGeocode } from '@/lib/api';

export function useEnvironmentData(onDataFetched?: (location: string, concern: string, data: EnvironmentData) => void) {
  const [location, setLocation] = useState('');
  const [concern, setConcern] = useState('Air Pollution');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [envData, setEnvData] = useState<EnvironmentData | null>(null);
  const [explanation, setExplanation] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const fetchData = useCallback(async (locToFetch: string, selectedConcern?: string) => {
    if (!locToFetch.trim()) return;

    setLoading(true);
    setError('');
    setEnvData(null);
    setExplanation('');

    try {
      const envJson = await fetchEnvironmentData(locToFetch);
      setEnvData(envJson);

      const explainJson = await fetchExplanation(
        locToFetch,
        selectedConcern || concern,
        envJson
      );
      setExplanation(explainJson.explanation);

      // Notify parent that data was fetched successfully
      onDataFetched?.(locToFetch, selectedConcern || concern, envJson);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [concern, onDataFetched]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchData(location);
  }, [location, fetchData]);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const data = await fetchGeocode(latitude, longitude);
          if (data.error) throw new Error(data.error);

          setLocation(data.city);
          await fetchData(data.city);
        } catch (err: any) {
          setError(err.message || 'Could not find your city.');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        setError(
          'Unable to retrieve your location. Browser may require HTTPS or Location access is denied.'
        );
      }
    );
  }, [fetchData]);

  return {
    location,
    setLocation,
    concern,
    setConcern,
    loading,
    error,
    envData,
    explanation,
    isLocating,
    handleSubmit,
    handleLocateMe,
    fetchData,
  };
}
