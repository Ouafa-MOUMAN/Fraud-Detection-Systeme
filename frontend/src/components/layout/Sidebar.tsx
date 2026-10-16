import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TableChartIcon from '@mui/icons-material/TableChart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useLocation, useNavigate } from 'react-router-dom';
import { COLORS } from '../../utils/constants';

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Transactions', path: '/transactions', icon: <TableChartIcon /> },
  { label: 'Analyse Fraudes', path: '/fraud-analysis', icon: <WarningAmberIcon /> },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: COLORS.sidebar,
          color: COLORS.white,
          border: 'none',
        },
      }}
    >
      {/* Logo / Brand */}
      <Box sx={{ px: 3, py: 3 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: COLORS.white, letterSpacing: 0.5 }}
        >
          Fraud
          <span style={{ color: COLORS.accentOrange }}>Watch</span>
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          Monitoring & Analyse
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mx: 2 }} />

      <List sx={{ px: 1, pt: 2 }}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  backgroundColor: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  borderLeft: isActive ? `3px solid ${COLORS.accentOrange}` : '3px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.08)',
                  },
                  transition: 'all 0.15s',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? COLORS.accentOrange : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      style: {
                        fontSize: '0.9rem',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? COLORS.white : 'rgba(255,255,255,0.7)',
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
          IEEE-CIS Fraud Detection
        </Typography>
      </Box>
    </Drawer>
  );
};

export { DRAWER_WIDTH };
export default Sidebar;
