import axiosInstance from './axiosInstance';
import type { MonitoringStatus } from '../types/monitoring';

export async function getMonitoringStatus(): Promise<MonitoringStatus> {
  const start = Date.now();
  const response = await axiosInstance.get<MonitoringStatus>('/api/monitoring/status');
  const elapsed = Date.now() - start;
  return { ...response.data, apiResponseTimeMs: elapsed };
}
