import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  accentColor?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, subtitle, accentColor = '#2196F3' }) => {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid #E5E7EB',
        height: '100%',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              variant="body2"
              sx={{ color: '#6B7280', fontWeight: 500, mb: 0.5, textTransform: 'uppercase', fontSize: '0.75rem' }}
            >
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A2035', lineHeight: 1.2 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: `${accentColor}1A`,
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
