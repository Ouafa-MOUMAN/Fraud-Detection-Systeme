export interface DashboardSummary {
  totalTransactions: number;
  fraudCount: number;
  legitimateCount: number;
  fraudRate: number;
  totalAmount: number;
  recentCount: number;            // backend field name
  recentTransactionsCount?: number; // alias for compatibility
  demoMode?: boolean;
}

export interface TrendData {
  label: string;   // backend field name
  period?: string; // alias for compatibility
  count: number;
  fraudCount?: number;
}

export interface FraudDistribution {
  fraudCount: number;
  legitimateCount: number;
  unknownCount: number;
  avgFraudAmount?: number;
  avgLegitimateAmount?: number;
  fraudRate: number;
  productDistribution?: ProductDistribution[];
  demoMode?: boolean;
}

export interface ProductDistribution {
  product: string;
  fraudCount: number;
  legitimateCount: number;
  total: number;
}

export interface AmountBucket {
  label: string;
  count: number;
  minAmount: number;
  maxAmount: number;
}
