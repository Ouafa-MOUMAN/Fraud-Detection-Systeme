import React from 'react';
import { Alert } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const DemoModeBanner: React.FC = () => {
  return (
    <Alert
      icon={<InfoOutlinedIcon />}
      severity="warning"
      sx={{ mb: 2, borderRadius: 2 }}
    >
      <strong>Mode démonstration</strong> — données simulées, non connecté à MongoDB
    </Alert>
  );
};

export default DemoModeBanner;
