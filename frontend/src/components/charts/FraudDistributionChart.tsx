import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';
import type { FraudDistribution } from '../../types/dashboard';
import { COLORS } from '../../utils/constants';

interface FraudDistributionChartProps {
  data: FraudDistribution | null;
}

const FraudDistributionChart: React.FC<FraudDistributionChartProps> = ({ data }) => {
  if (!data) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <Typography color="text.secondary">Aucune donnée disponible</Typography>
      </Box>
    );
  }

  const chartData = [
    { name: 'Fraudes', value: data.fraudCount, color: COLORS.fraud },
    { name: 'Légitimes', value: data.legitimateCount, color: COLORS.legitimate },
    { name: 'Inconnu', value: data.unknownCount, color: COLORS.unknown },
  ].filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: unknown) => [
            typeof value === 'number' ? value.toLocaleString('fr-FR') : String(value),
            '',
          ]}
          contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default FraudDistributionChart;
