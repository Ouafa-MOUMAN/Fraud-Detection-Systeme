import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography } from '@mui/material';
import type { AmountBucket } from '../../types/dashboard';
import { COLORS } from '../../utils/constants';

interface AmountDistributionChartProps {
  data: AmountBucket[];
}

const AmountDistributionChart: React.FC<AmountDistributionChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <Typography color="text.secondary">Aucune donnée disponible</Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }}
          formatter={(value: unknown) => [
            typeof value === 'number' ? value.toLocaleString('fr-FR') : String(value),
            'Transactions',
          ]}
        />
        <Bar dataKey="count" fill={COLORS.blue} radius={[4, 4, 0, 0]} name="Transactions" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AmountDistributionChart;
