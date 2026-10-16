export interface Transaction {
  transactionId: number;
  transactionDT: number;
  transactionAmt: number;
  productCD: string;
  isFraud: number | null;
  card1?: number;
  card2?: number;
  card3?: number;
  card4?: string;
  card5?: number;
  card6?: string;
}

export interface TransactionDetail extends Transaction {
  addr1?: number;
  addr2?: number;
  dist1?: number;
  dist2?: number;
  pEmaildomain?: string;
  rEmaildomain?: string;
  cFields?: Record<string, number | null>;
  dFields?: Record<string, number | null>;
  mFields?: Record<string, string | null>;
}

export interface TransactionFilter {
  transactionId?: string;
  minAmount?: number;
  maxAmount?: number;
  isFraud?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
