import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import TopBar from './TopBar';
import { COLORS } from '../../utils/constants';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: COLORS.background }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: `calc(100% - ${DRAWER_WIDTH}px)` }}>
        <TopBar />
        <Toolbar /> {/* spacer for fixed AppBar */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
