import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  Skeleton,
  Typography,
} from '@mui/material';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { exportCsv } from '../api/transactionApi';
import ErrorAlert from '../components/common/ErrorAlert';
import EmptyState from '../components/common/EmptyState';
import { formatAmount, formatDate } from '../utils/formatters';
import { FRAUD_FILTER_OPTIONS, PAGE_SIZE_OPTIONS } from '../utils/constants';
import type { TransactionFilter } from '../types/transaction';

type SortDir = 'asc' | 'desc';

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const { transactions, total, loading, error, filter, setFilter, resetFilters } = useTransactions();

  const [localFilter, setLocalFilter] = useState({
    transactionId: '',
    minAmount: '',
    maxAmount: '',
    isFraud: '',
    startDate: '',
    endDate: '',
  });

  const handleSearch = () => {
    const partial: Partial<TransactionFilter> = {};
    if (localFilter.transactionId) partial.transactionId = localFilter.transactionId;
    if (localFilter.minAmount) partial.minAmount = Number(localFilter.minAmount);
    if (localFilter.maxAmount) partial.maxAmount = Number(localFilter.maxAmount);
    partial.isFraud = localFilter.isFraud;
    if (localFilter.startDate) partial.startDate = localFilter.startDate;
    if (localFilter.endDate) partial.endDate = localFilter.endDate;
    setFilter(partial);
  };

  const handleReset = () => {
    setLocalFilter({ transactionId: '', minAmount: '', maxAmount: '', isFraud: '', startDate: '', endDate: '' });
    resetFilters();
  };

  const handleSort = (column: string) => {
    const isAsc = filter.sortBy === column && filter.sortDir === 'asc';
    setFilter({ sortBy: column, sortDir: isAsc ? 'desc' : 'asc' });
  };

  const handleExport = async () => {
    try {
      const blob = await exportCsv(filter);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };

  const sortDir = (filter.sortDir ?? 'desc') as SortDir;

  return (
    <Box>
      {/* Filter panel */}
      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              label="ID Transaction"
              size="small"
              value={localFilter.transactionId}
              onChange={(e) => setLocalFilter((p) => ({ ...p, transactionId: e.target.value }))}
              sx={{ minWidth: 160 }}
            />
            <TextField
              label="Montant min ($)"
              size="small"
              type="number"
              value={localFilter.minAmount}
              onChange={(e) => setLocalFilter((p) => ({ ...p, minAmount: e.target.value }))}
              sx={{ minWidth: 130 }}
            />
            <TextField
              label="Montant max ($)"
              size="small"
              type="number"
              value={localFilter.maxAmount}
              onChange={(e) => setLocalFilter((p) => ({ ...p, maxAmount: e.target.value }))}
              sx={{ minWidth: 130 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Statut fraude</InputLabel>
              <Select
                value={localFilter.isFraud}
                label="Statut fraude"
                onChange={(e) => setLocalFilter((p) => ({ ...p, isFraud: e.target.value }))}
              >
                {FRAUD_FILTER_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Date début"
              size="small"
              type="date"
              value={localFilter.startDate}
              onChange={(e) => setLocalFilter((p) => ({ ...p, startDate: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              label="Date fin"
              size="small"
              type="date"
              value={localFilter.endDate}
              onChange={(e) => setLocalFilter((p) => ({ ...p, endDate: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 160 }}
            />
            <Button variant="contained" onClick={handleSearch} sx={{ minWidth: 100 }}>
              Filtrer
            </Button>
            <Button
              variant="outlined"
              startIcon={<FilterListOffIcon />}
              onClick={handleReset}
              sx={{ minWidth: 140 }}
            >
              Réinitialiser
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => void handleExport()}
              sx={{ minWidth: 140 }}
            >
              Export CSV
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
        {error && <ErrorAlert error={error} onRetry={() => setFilter({})} />}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
                <TableCell>
                  <TableSortLabel
                    active={filter.sortBy === 'transactionId'}
                    direction={filter.sortBy === 'transactionId' ? sortDir : 'asc'}
                    onClick={() => handleSort('transactionId')}
                  >
                    ID Transaction
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={filter.sortBy === 'transactionAmt'}
                    direction={filter.sortBy === 'transactionAmt' ? sortDir : 'asc'}
                    onClick={() => handleSort('transactionAmt')}
                  >
                    Montant
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={filter.sortBy === 'transactionDT'}
                    direction={filter.sortBy === 'transactionDT' ? sortDir : 'asc'}
                    onClick={() => handleSort('transactionDT')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>Produit</TableCell>
                <TableCell>Carte</TableCell>
                <TableCell>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState />
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow
                    key={tx.transactionId}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/transactions/${tx.transactionId}`)}
                  >
                    <TableCell>{tx.transactionId}</TableCell>
                    <TableCell>{formatAmount(tx.transactionAmt)}</TableCell>
                    <TableCell>{formatDate(tx.transactionDT)}</TableCell>
                    <TableCell>{tx.productCD}</TableCell>
                    <TableCell>{tx.card4 ?? '—'}</TableCell>
                    <TableCell>
                      {tx.isFraud === null ? (
                        <Chip label="Inconnu" size="small" sx={{ backgroundColor: '#E5E7EB' }} />
                      ) : tx.isFraud === 1 ? (
                        <Chip label="Fraude" size="small" color="error" />
                      ) : (
                        <Chip label="Légitime" size="small" color="success" />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {total.toLocaleString('fr-FR')} résultats
          </Typography>
          <TablePagination
            component="div"
            count={total}
            page={filter.page ?? 0}
            onPageChange={(_e, page) => setFilter({ page })}
            rowsPerPage={filter.size ?? 25}
            onRowsPerPageChange={(e) => setFilter({ size: Number(e.target.value), page: 0 })}
            rowsPerPageOptions={[...PAGE_SIZE_OPTIONS]}
            labelRowsPerPage="Lignes par page"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default Transactions;
