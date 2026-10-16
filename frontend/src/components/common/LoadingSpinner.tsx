import React from 'react';
import { Box, CircularProgress } from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
  minHeight?: string | number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 48, minHeight = '200px' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        width: '100%',
      }}
    >
      <CircularProgress size={size} />
    </Box>
  );
};

export default LoadingSpinner;
