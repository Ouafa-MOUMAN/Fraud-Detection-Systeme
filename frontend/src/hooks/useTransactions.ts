import { useState, useEffect, useCallback } from 'react';
import { getTransactions } from '../api/transactionApi';
import type { Transaction, TransactionFilter } from '../types/transaction';
import type { ApiError } from '../types/api';

const DEFAULT_FILTER: TransactionFilter = {
  page: 0,
  size: 25,
  sortBy: 'transactionDT',
  sortDir: 'desc',
};

interface UseTransactionsReturn {
  transactions: Transaction[];
  total: number;
  loading: boolean;
  error: ApiError | null;
  filter: TransactionFilter;
  setFilter: (f: Partial<TransactionFilter>) => void;
  resetFilters: () => void;
}

export function useTransactions(): UseTransactionsReturn {
  const [filter, setFilterState] = useState<TransactionFilter>(DEFAULT_FILTER);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchTransactions = useCallback(async (f: TransactionFilter) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTransactions(f);
      setTransactions(result.content);
      setTotal(result.totalElements);
    } catch (err) {
      setError(err as ApiError);
      setTransactions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTransactions(filter);
  }, [filter, fetchTransactions]);

  const setFilter = useCallback((partial: Partial<TransactionFilter>) => {
    setFilterState((prev) => ({ ...prev, ...partial, page: 0 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilterState(DEFAULT_FILTER);
  }, []);

  return { transactions, total, loading, error, filter, setFilter, resetFilters };
}
