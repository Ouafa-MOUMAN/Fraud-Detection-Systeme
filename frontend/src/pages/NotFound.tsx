import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
      }}
    >
      <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 700, color: '#E5E7EB', lineHeight: 1 }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
        Page introuvable
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        La page que vous cherchez n'existe pas ou a été déplacée.
      </Typography>
      <Button
        variant="contained"
        startIcon={<HomeIcon />}
        onClick={() => navigate('/')}
        size="large"
      >
        Retour au Dashboard
      </Button>
    </Box>
  );
};

export default NotFound;
