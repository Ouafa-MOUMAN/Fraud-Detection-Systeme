export const API_BASE_URL: string = (import.meta.env['VITE_API_BASE_URL'] as string | undefined) ?? 'http://localhost:8080';

export const COLORS = {
  sidebar: '#1A2035',
  accentOrange: '#FF6B35',
  blue: '#2196F3',
  background: '#F4F6F9',
  fraud: '#F44336',
  legitimate: '#4CAF50',
  unknown: '#9E9E9E',
  white: '#FFFFFF',
  textPrimary: '#1A2035',
  textSecondary: '#6B7280',
} as const;

export const SORT_OPTIONS = [
  { value: 'transactionDT', label: 'Date' },
  { value: 'transactionAmt', label: 'Montant' },
  { value: 'transactionId', label: 'ID Transaction' },
] as const;

export const FRAUD_FILTER_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: '1', label: 'Fraude' },
  { value: '0', label: 'Légitime' },
] as const;

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
