import { useState, useEffect, useCallback } from 'react';
import { getDashboardSummary, getTransactionTrends, getFraudDistribution } from '../api/dashboardApi';
import type { DashboardSummary, TrendData, FraudDistribution } from '../types/dashboard';
import type { ApiError } from '../types/api';

interface DashboardData {
  summary: DashboardSummary | null;
  trends: TrendData[];
  distribution: FraudDistribution | null;
}

interface UseDashboardReturn {
  data: DashboardData;
  loading: boolean;
  error: ApiError | null;
  refresh: () => void;
}

export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData>({
    summary: null,
    trends: [],
    distribution: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summary, trends, distribution] = await Promise.all([
        getDashboardSummary(),
        getTransactionTrends('daily'),
        getFraudDistribution(),
      ]);
      setData({ summary, trends, distribution });
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  return { data, loading, error, refresh: fetchAll };
}
