import React, { useCallback } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useDashboard } from '../hooks/useDashboard';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { getTransactions } from '../api/transactionApi';
import KpiCard from '../components/common/KpiCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import DemoModeBanner from '../components/common/DemoModeBanner';
import TransactionTrendChart from '../components/charts/TransactionTrendChart';
import FraudDistributionChart from '../components/charts/FraudDistributionChart';
import AmountDistributionChart from '../components/charts/AmountDistributionChart';
import { formatAmount, formatDate, formatNumber, formatPercent } from '../utils/formatters';
import { COLORS } from '../utils/constants';
import type { Transaction } from '../types/transaction';
import type { AmountBucket } from '../types/dashboard';

const SectionTitle: React.FC<{ children: string }> = ({ children }) => (
  <Typography variant="h6" sx={{ fontWeight: 600 }}>
    {children}
  </Typography>
);

const ValueText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="body2" sx={{ fontWeight: 600 }}>
    {children}
  </Typography>
);

const Dashboard: React.FC = () => {
  const { data, loading, error, refresh } = useDashboard();
  const [recentTx, setRecentTx] = React.useState<Transaction[]>([]);
  const [recentLoading, setRecentLoading] = React.useState(true);

  const fetchRecent = useCallback(async () => {
    try {
      const result = await getTransactions({ page: 0, size: 5, sortBy: 'transactionDT', sortDir: 'desc' });
      setRecentTx(result.content);
    } catch {
      // silently ignore
    } finally {
      setRecentLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchRecent();
  }, [fetchRecent]);

  useAutoRefresh(refresh, 30_000, true);

  const buildAmountBuckets = (): AmountBucket[] => {
    if (!data.summary) return [];
    const buckets: AmountBucket[] = [
      { label: '$0-50', minAmount: 0, maxAmount: 50, count: 0 },
      { label: '$50-100', minAmount: 50, maxAmount: 100, count: 0 },
      { label: '$100-500', minAmount: 100, maxAmount: 500, count: 0 },
      { label: '$500-1000', minAmount: 500, maxAmount: 1000, count: 0 },
      { label: '$1000+', minAmount: 1000, maxAmount: Infinity, count: 0 },
    ];
    recentTx.forEach((tx) => {
      const b = buckets.find((bk) => tx.transactionAmt >= bk.minAmount && tx.transactionAmt < bk.maxAmount);
      if (b) b.count++;
    });
    return buckets;
  };

  if (loading && !data.summary) {
    return <LoadingSpinner minHeight="60vh" />;
  }

  if (error && !data.summary) {
    return <ErrorAlert error={error} onRetry={refresh} />;
  }

  const summary = data.summary;
  const demoMode = summary?.demoMode ?? false;

  return (
    <Box>
      {demoMode && <DemoModeBanner />}

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiCard
            title="Total Transactions"
            value={summary ? formatNumber(summary.totalTransactions) : '—'}
            icon={<AssessmentIcon />}
            accentColor={COLORS.blue}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiCard
            title="Fraudes Confirmées"
            value={summary ? formatNumber(summary.fraudCount) : '—'}
            icon={<WarningAmberIcon />}
            accentColor={COLORS.fraud}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiCard
            title="Légitimes"
            value={summary ? formatNumber(summary.legitimateCount) : '—'}
            icon={<CheckCircleOutlinedIcon />}
            accentColor={COLORS.legitimate}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiCard
            title="Taux de Fraude"
            value={summary ? `${summary.fraudRate.toFixed(2)}%` : '—'}
            icon={<TrendingUpIcon />}
            accentColor={COLORS.accentOrange}
            subtitle="Sur transactions étiquetées"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiCard
            title="Montant Total"
            value={summary ? formatAmount(summary.totalAmount) : '—'}
            icon={<AttachMoneyIcon />}
            accentColor={COLORS.blue}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiCard
            title="Transactions Récentes"
            value={summary ? formatNumber(summary.recentCount) : '—'}
            icon={<AccessTimeIcon />}
            accentColor={COLORS.legitimate}
            subtitle="Dernières 24h"
          />
        </Grid>
      </Grid>

      {/* Charts row 1 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
            <CardHeader title={<SectionTitle>Volume des transactions</SectionTitle>} />
            <CardContent>
              {loading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : (
                <TransactionTrendChart data={data.trends} />
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
            <CardHeader title={<SectionTitle>Répartition fraude / légitime</SectionTitle>} />
            <CardContent>
              {loading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : (
                <FraudDistributionChart data={data.distribution} />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts row 2 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
            <CardHeader title={<SectionTitle>Distribution des montants</SectionTitle>} />
            <CardContent>
              <AmountDistributionChart data={buildAmountBuckets()} />
            </CardContent>
          </Card>
        </Grid>

        {/* Pipeline status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, height: '100%' }}>
            <CardHeader title={<SectionTitle>Statut du pipeline</SectionTitle>} />
            <CardContent>
              {data.distribution ? (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Transactions fraudes</Typography>
                    <ValueText>{formatNumber(data.distribution.fraudCount)}</ValueText>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Transactions légitimes</Typography>
                    <ValueText>{formatNumber(data.distribution.legitimateCount)}</ValueText>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Transactions inconnues</Typography>
                    <ValueText>{formatNumber(data.distribution.unknownCount)}</ValueText>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Taux de fraude</Typography>
                    <ValueText>{formatPercent(data.distribution.fraudRate)}</ValueText>
                  </Box>
                </Box>
              ) : (
                <Typography color="text.secondary">Données non disponibles</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent transactions */}
      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
        <CardHeader title={<SectionTitle>Dernières transactions</SectionTitle>} />
        <CardContent sx={{ p: 0 }}>
          {recentLoading ? (
            <Box sx={{ p: 2 }}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height={52} sx={{ mb: 0.5 }} />
              ))}
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Montant</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Produit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTx.map((tx) => (
                  <TableRow key={tx.transactionId} hover>
                    <TableCell>{tx.transactionId}</TableCell>
                    <TableCell>{formatAmount(tx.transactionAmt)}</TableCell>
                    <TableCell>{formatDate(tx.transactionDT)}</TableCell>
                    <TableCell>{tx.productCD}</TableCell>
                    <TableCell>
                      {tx.isFraud === null ? (
                        <Chip label="Inconnu" size="small" sx={{ backgroundColor: '#E5E7EB' }} />
                      ) : tx.isFraud === 1 ? (
                        <Chip label="Fraude" size="small" color="error" />
                      ) : (
                        <Chip label="Légitime" size="small" color="success" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {recentTx.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">Aucune transaction récente</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
