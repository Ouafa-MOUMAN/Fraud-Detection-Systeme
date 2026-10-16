import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Box, Typography } from '@mui/material';
import type { TrendData } from '../../types/dashboard';
import { COLORS } from '../../utils/constants';

interface TransactionTrendChartProps {
  data: TrendData[];
}

const TransactionTrendChart: React.FC<TransactionTrendChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <Typography color="text.secondary">Aucune donnée de tendance disponible</Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }}
          formatter={(value: unknown, name: unknown) => [
            typeof value === 'number' ? value.toLocaleString('fr-FR') : String(value),
            name === 'count' ? 'Total' : 'Fraudes',
          ]}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="count"
          stroke={COLORS.blue}
          strokeWidth={2}
          dot={false}
          name="Total"
        />
        <Line
          type="monotone"
          dataKey="fraudCount"
          stroke={COLORS.fraud}
          strokeWidth={2}
          dot={false}
          name="Fraudes"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TransactionTrendChart;
