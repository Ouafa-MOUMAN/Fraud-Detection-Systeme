import axiosInstance from './axiosInstance';
import type { PagedResponse } from '../types/api';
import type { Transaction, TransactionDetail, TransactionFilter } from '../types/transaction';

export async function getTransactions(filter: TransactionFilter = {}): Promise<PagedResponse<Transaction>> {
  const params: Record<string, string | number> = {};

  if (filter.transactionId) params['transactionId'] = filter.transactionId;
  if (filter.minAmount !== undefined) params['minAmt'] = filter.minAmount;
  if (filter.maxAmount !== undefined) params['maxAmt'] = filter.maxAmount;
  if (filter.isFraud !== undefined && filter.isFraud !== '') params['isFraud'] = filter.isFraud;
  if (filter.page !== undefined) params['page'] = filter.page;
  if (filter.size !== undefined) params['size'] = filter.size;
  if (filter.sortBy) params['sortBy'] = filter.sortBy;
  if (filter.sortDir) params['sortDir'] = filter.sortDir;

  const response = await axiosInstance.get<PagedResponse<Transaction>>('/api/transactions', { params });
  return response.data;
}

export async function getTransactionById(id: number): Promise<TransactionDetail> {
  const response = await axiosInstance.get<TransactionDetail>(`/api/transactions/${id}`);
  return response.data;
}

export async function exportCsv(filter: TransactionFilter = {}): Promise<Blob> {
  const params: Record<string, string | number> = {};

  if (filter.transactionId) params['transactionId'] = filter.transactionId;
  if (filter.minAmount !== undefined) params['minAmt'] = filter.minAmount;
  if (filter.maxAmount !== undefined) params['maxAmt'] = filter.maxAmount;
  if (filter.isFraud !== undefined && filter.isFraud !== '') params['isFraud'] = filter.isFraud;

  const response = await axiosInstance.get('/api/transactions/export', {
    params,
    responseType: 'blob',
  });
  return response.data as Blob;
}
