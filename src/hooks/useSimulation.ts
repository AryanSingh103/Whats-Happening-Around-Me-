'use client';

import { useState, useCallback } from 'react';
import { SimData } from '@/types';
import { SCENARIOS, TRAJECTORIES } from '@/lib/constants';
import { fetchSimulation } from '@/lib/api';

export function useSimulation() {
  const [currentAge, setCurrentAge] = useState<number | ''>('');
  const [simAge, setSimAge] = useState<number | ''>('');
  const [simCity, setSimCity] = useState('');
  const [simScenario, setSimScenario] = useState(SCENARIOS[0]);
  const [simTrajectory, setSimTrajectory] = useState(2);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState('');
  const [simData, setSimData] = useState<SimData | null>(null);
  const [simFutureYear, setSimFutureYear] = useState<number | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!simCity.trim() || !simAge || !currentAge || simAge <= currentAge) {
      if (
        typeof simAge === 'number' &&
        typeof currentAge === 'number' &&
        simAge <= currentAge
      ) {
        setSimError('Future Age must be greater than Current Age.');
      }
      return;
    }

    setSimLoading(true);
    setSimError('');
    setSimData(null);
    setSimFutureYear(null);

    const trajectoryLabel = TRAJECTORIES.find(
      (t) => t.value === simTrajectory
    )?.label;

    try {
      const json = await fetchSimulation({
        currentAge: currentAge as number,
        futureAge: simAge as number,
        city: simCity,
        scenario: simScenario,
        trajectory: trajectoryLabel || 'Current Path',
      });
      setSimData(json.data);
      setSimFutureYear(json.futureYear);
    } catch (err: any) {
      setSimError(err.message || 'Something went wrong.');
    } finally {
      setSimLoading(false);
    }
  }, [simCity, simAge, currentAge, simScenario, simTrajectory]);

  return {
    currentAge,
    setCurrentAge,
    simAge,
    setSimAge,
    simCity,
    setSimCity,
    simScenario,
    setSimScenario,
    simTrajectory,
    setSimTrajectory,
    simLoading,
    simError,
    simData,
    simFutureYear,
    handleSubmit,
  };
}
