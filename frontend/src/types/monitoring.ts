export interface MonitoringStatus {
  dbConnected: boolean;
  documentCount: number;
  lastImportDate: string | null;
  lastRefreshDate: string;
  apiResponseTimeMs: number;
  importErrors: string[];
  demoMode?: boolean;
}
