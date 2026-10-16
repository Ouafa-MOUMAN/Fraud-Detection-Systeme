import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import MainLayout from './components/layout/MainLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Transactions = React.lazy(() => import('./pages/Transactions'));
const TransactionDetail = React.lazy(() => import('./pages/TransactionDetail'));
const FraudAnalysis = React.lazy(() => import('./pages/FraudAnalysis'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

const theme = createTheme({
  palette: {
    primary: {
      main: '#1A2035',
    },
    secondary: {
      main: '#FF6B35',
    },
    background: {
      default: '#F4F6F9',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <MainLayout>
          <Suspense fallback={<LoadingSpinner minHeight="60vh" />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/transactions/:transactionId" element={<TransactionDetail />} />
              <Route path="/fraud-analysis" element={<FraudAnalysis />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </MainLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
