import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Chip,
  Button,
  Divider,
  Skeleton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getTransactionById } from '../api/transactionApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { formatAmount, formatDate } from '../utils/formatters';
import type { TransactionDetail as TxDetail } from '../types/transaction';
import type { ApiError } from '../types/api';

const SectionTitle: React.FC<{ children: string }> = ({ children }) => (
  <Typography variant="h6" sx={{ fontWeight: 600 }}>{children}</Typography>
);

const DetailRow: React.FC<{ label: string; value: string | number | null | undefined }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 500 }}>
      {value !== null && value !== undefined ? String(value) : '—'}
    </Typography>
  </Box>
);

const TransactionDetail: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const [tx, setTx] = useState<TxDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (!transactionId) return;
    setLoading(true);
    setError(null);
    getTransactionById(Number(transactionId))
      .then(setTx)
      .catch((err: ApiError) => setError(err))
      .finally(() => setLoading(false));
  }, [transactionId]);

  if (loading) return <LoadingSpinner minHeight="60vh" />;
  if (error) return <ErrorAlert error={error} onRetry={() => navigate('/transactions')} />;
  if (!tx) return null;

  const cFields = tx.cFields ?? {};
  const dFields = tx.dFields ?? {};
  const mFields = tx.mFields ?? {};

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/transactions')}
        sx={{ mb: 3 }}
        variant="outlined"
      >
        Retour aux transactions
      </Button>

      <Grid container spacing={3}>
        {/* General info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
            <CardHeader
              title={<SectionTitle>Informations générales</SectionTitle>}
              action={
                tx.isFraud === null ? (
                  <Chip label="Label inconnu" size="small" sx={{ backgroundColor: '#E5E7EB' }} />
                ) : tx.isFraud === 1 ? (
                  <Chip label="Fraude confirmée" size="small" color="error" />
                ) : (
                  <Chip label="Transaction légitime" size="small" color="success" />
                )
              }
            />
            <CardContent>
              <DetailRow label="ID Transaction" value={tx.transactionId} />
              <Divider />
              <DetailRow label="Montant" value={formatAmount(tx.transactionAmt)} />
              <Divider />
              <DetailRow label="Date (TransactionDT)" value={formatDate(tx.transactionDT)} />
              <Divider />
              <DetailRow label="Type de produit (ProductCD)" value={tx.productCD} />
              <Divider />
              <DetailRow label="Label isFraud" value={tx.isFraud !== null ? String(tx.isFraud) : null} />
            </CardContent>
          </Card>
        </Grid>

        {/* Card data */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
            <CardHeader title={<SectionTitle>Données carte</SectionTitle>} />
            <CardContent>
              <DetailRow label="card1" value={tx.card1} />
              <Divider />
              <DetailRow label="card2" value={tx.card2} />
              <Divider />
              <DetailRow label="card3" value={tx.card3} />
              <Divider />
              <DetailRow label="card4" value={tx.card4} />
              <Divider />
              <DetailRow label="card5" value={tx.card5} />
              <Divider />
              <DetailRow label="card6" value={tx.card6} />
            </CardContent>
          </Card>
        </Grid>

        {/* Address & Distance */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
            <CardHeader title={<SectionTitle>Adresses &amp; Distances</SectionTitle>} />
            <CardContent>
              <DetailRow label="addr1" value={tx.addr1} />
              <Divider />
              <DetailRow label="addr2" value={tx.addr2} />
              <Divider />
              <DetailRow label="dist1" value={tx.dist1} />
              <Divider />
              <DetailRow label="dist2" value={tx.dist2} />
              <Divider />
              <DetailRow label="P_emaildomain" value={tx.pEmaildomain} />
              <Divider />
              <DetailRow label="R_emaildomain" value={tx.rEmaildomain} />
            </CardContent>
          </Card>
        </Grid>

        {/* Indicateurs C */}
        {Object.keys(cFields).length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
              <CardHeader title={<SectionTitle>Indicateurs C</SectionTitle>} />
              <CardContent>
                {loading ? (
                  [...Array(6)].map((_, i) => <Skeleton key={i} height={32} />)
                ) : (
                  Object.entries(cFields).map(([key, val], i) => (
                    <React.Fragment key={key}>
                      {i > 0 && <Divider />}
                      <DetailRow label={key} value={val} />
                    </React.Fragment>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Indicateurs D */}
        {Object.keys(dFields).length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
              <CardHeader title={<SectionTitle>Indicateurs D</SectionTitle>} />
              <CardContent>
                {Object.entries(dFields).map(([key, val], i) => (
                  <React.Fragment key={key}>
                    {i > 0 && <Divider />}
                    <DetailRow label={key} value={val} />
                  </React.Fragment>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Indicateurs M */}
        {Object.keys(mFields).length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
              <CardHeader title={<SectionTitle>Indicateurs M</SectionTitle>} />
              <CardContent>
                {Object.entries(mFields).map(([key, val], i) => (
                  <React.Fragment key={key}>
                    {i > 0 && <Divider />}
                    <DetailRow label={key} value={val} />
                  </React.Fragment>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TransactionDetail;
