import React from 'react';
import { Alert, AlertTitle, Button, Box } from '@mui/material';
import type { ApiError } from '../../types/api';

interface ErrorAlertProps {
  error: ApiError | string;
  onRetry?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onRetry }) => {
  const message = typeof error === 'string' ? error : error.message;

  return (
    <Box sx={{ my: 2 }}>
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Réessayer
            </Button>
          ) : undefined
        }
      >
        <AlertTitle>Erreur</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorAlert;
