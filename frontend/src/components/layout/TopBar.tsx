import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, InputBase } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import { useLocation } from 'react-router-dom';
import { DRAWER_WIDTH } from './Sidebar';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Explorateur des transactions',
  '/fraud-analysis': 'Analyse des fraudes',
  '/monitoring': 'Monitoring du pipeline',
};

interface TopBarProps {
  onSearch?: (query: string) => void;
  showSearch?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onSearch, showSearch = false }) => {
  const location = useLocation();

  const title =
    PAGE_TITLES[location.pathname] ??
    (location.pathname.startsWith('/transactions/') ? 'Détail de transaction' : 'FraudWatch');

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        ml: `${DRAWER_WIDTH}px`,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        color: '#1A2035',
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
          {title}
        </Typography>

        {showSearch && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F4F6F9',
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              mr: 2,
              width: 240,
            }}
          >
            <SearchIcon sx={{ color: '#9E9E9E', mr: 1, fontSize: 20 }} />
            <InputBase
              placeholder="Rechercher…"
              onChange={(e) => onSearch?.(e.target.value)}
              sx={{ fontSize: '0.875rem', flex: 1 }}
            />
          </Box>
        )}

        <IconButton>
          <AccountCircleIcon sx={{ color: '#1A2035' }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
