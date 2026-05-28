'use client';

import { useState, useCallback } from 'react';
import { SimData } from '@/types';
import { SCENARIOS, TRAJECTORIES } from '@/lib/constants';
import { fetchSimulation } from '@/lib/api';

export function useSimulation() {
  const [yearsInFuture, setYearsInFuture] = useState<number | ''>(30);
  const [simCity, setSimCity] = useState('');
  const [simScenario, setSimScenario] = useState(SCENARIOS[0]);
  const [simTrajectory, setSimTrajectory] = useState(2);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState('');
  const [simData, setSimData] = useState<SimData | null>(null);
  const [simFutureYear, setSimFutureYear] = useState<number | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!simCity.trim() || !yearsInFuture || yearsInFuture <= 0) {
      if (typeof yearsInFuture === 'number' && yearsInFuture <= 0) {
        setSimError('Years into the future must be greater than 0.');
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
        yearsInFuture: yearsInFuture as number,
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
  }, [simCity, yearsInFuture, simScenario, simTrajectory]);

  return {
    yearsInFuture,
    setYearsInFuture,
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
