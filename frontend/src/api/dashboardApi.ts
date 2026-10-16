import axiosInstance from './axiosInstance';
import type { DashboardSummary, TrendData, FraudDistribution } from '../types/dashboard';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await axiosInstance.get<DashboardSummary>('/api/dashboard/summary');
  return response.data;
}

export async function getTransactionTrends(period: string = 'daily'): Promise<TrendData[]> {
  const response = await axiosInstance.get<TrendData[]>('/api/dashboard/transaction-trends', {
    params: { period },
  });
  return response.data;
}

export async function getFraudDistribution(): Promise<FraudDistribution> {
  const response = await axiosInstance.get<FraudDistribution>('/api/dashboard/fraud-distribution');
  return response.data;
}
