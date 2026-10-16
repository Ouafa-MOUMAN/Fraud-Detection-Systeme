import { useState, useEffect, useCallback } from 'react';
import { getMonitoringStatus } from '../api/monitoringApi';
import type { MonitoringStatus } from '../types/monitoring';
import type { ApiError } from '../types/api';

interface UseMonitoringReturn {
  status: MonitoringStatus | null;
  loading: boolean;
  error: ApiError | null;
  refresh: () => void;
}

export function useMonitoring(): UseMonitoringReturn {
  const [status, setStatus] = useState<MonitoringStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMonitoringStatus();
      setStatus(data);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  return { status, loading, error, refresh: fetchStatus };
}
