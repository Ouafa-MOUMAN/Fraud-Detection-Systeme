import React from 'react';
import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  message?: string;
  subMessage?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'Aucune donnée disponible',
  subMessage = 'Aucun résultat ne correspond à vos critères de recherche.',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        color: '#9E9E9E',
      }}
    >
      <InboxIcon sx={{ fontSize: 64, mb: 2, opacity: 0.4 }} />
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
        {message}
      </Typography>
      <Typography variant="body2" sx={{ textAlign: 'center', maxWidth: 400 }}>
        {subMessage}
      </Typography>
    </Box>
  );
};

export default EmptyState;
