// Reference date for transactionDT (seconds offset from 2017-11-30)
const TRANSACTION_REF_DATE = new Date('2017-11-30T00:00:00Z');

export function formatAmount(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/**
 * Convert transactionDT (seconds since 2017-11-30) to a readable date string
 */
export function formatDate(dt: number): string {
  const date = new Date(TRANSACTION_REF_DATE.getTime() + dt * 1000);
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatPercent(n: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n / 100);
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(iso));
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n);
}
