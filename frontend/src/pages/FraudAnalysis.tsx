import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  TextField,
  MenuItem,
  Button,
  Divider,
  Collapse,
  IconButton,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  LinearProgress,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SettingsIcon from '@mui/icons-material/Settings';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import EmailIcon from '@mui/icons-material/Email';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { COLORS } from '../utils/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormValues {
  transactionAmt: string;
  productCD: string;
  card1: string;
  card2: string;
  card3: string;
  card4: string;
  card5: string;
  card6: string;
  addr1: string;
  addr2: string;
  pEmaildomain: string;
  rEmaildomain: string;
}

interface PredictionResult {
  isFraud: boolean;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRODUCT_OPTIONS = ['W', 'H', 'C', 'S', 'R'];
const EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'mail.com', 'icloud.com', 'protonmail.com', 'anonymous.com', 'Autre',
];
const CARD4_OPTIONS = ['visa', 'mastercard', 'american express', 'discover'];
const CARD6_OPTIONS = ['credit', 'debit', 'charge card', 'debit or credit'];

const INITIAL_FORM: FormValues = {
  transactionAmt: '', productCD: '',
  card1: '', card2: '', card3: '', card4: '', card5: '', card6: '',
  addr1: '', addr2: '', pEmaildomain: '', rEmaildomain: '',
};

// ─── SectionHeader ────────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  expanded: boolean;
  onToggle: () => void;
}> = ({ icon, title, expanded, onToggle }) => (
  <Box
    onClick={onToggle}
    sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      p: 1.5, cursor: 'pointer',
      borderBottom: expanded ? '1px solid #E5E7EB' : 'none',
      '&:hover': { backgroundColor: '#F9FAFB' },
      borderRadius: expanded ? '8px 8px 0 0' : 2,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ color: COLORS.blue, display: 'flex' }}>{icon}</Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{title}</Typography>
    </Box>
    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
      {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
    </IconButton>
  </Box>
);

// ─── FieldLabel ───────────────────────────────────────────────────────────────

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block', color: '#374151' }}>
    {children}
  </Typography>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const FraudAnalysis: React.FC = () => {
  const [form, setForm] = useState<FormValues>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [errors, setErrors] = useState<Partial<FormValues>>({});

  const [openGeneral, setOpenGeneral] = useState(true);
  const [openCard, setOpenCard] = useState(true);
  const [openAddress, setOpenAddress] = useState(true);
  const [openExtra, setOpenExtra] = useState(false);

  const handleChange = (field: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const validate = (): boolean => {
    const e: Partial<FormValues> = {};
    if (!form.transactionAmt || isNaN(Number(form.transactionAmt)) || Number(form.transactionAmt) <= 0)
      e.transactionAmt = 'Montant invalide (> 0)';
    if (!form.productCD) e.productCD = 'Requis';
    if (!form.card1) e.card1 = 'Requis';
    if (!form.card2) e.card2 = 'Requis';
    if (!form.card3) e.card3 = 'Requis';
    if (!form.card4) e.card4 = 'Requis';
    if (!form.card5) e.card5 = 'Requis';
    if (!form.card6) e.card6 = 'Requis';
    if (!form.addr1) e.addr1 = 'Requis';
    if (!form.addr2) e.addr2 = 'Requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const simulatePrediction = (f: FormValues): PredictionResult => {
    const amt = Number(f.transactionAmt);
    let score = 0;
    if (amt > 5000) score += 40;
    else if (amt > 1000) score += 20;
    else if (amt > 500) score += 10;
    if (f.productCD === 'C' || f.productCD === 'S') score += 15;
    if (f.pEmaildomain === 'anonymous.com') score += 25;
    if (f.card6 === 'charge card') score += 10;
    if (Number(f.addr2) > 200) score += 10;
    const confidence = Math.min(score, 95);
    const isFraud = score >= 40;
    const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' =
      score >= 60 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW';
    return {
      isFraud, confidence, riskLevel,
      message: isFraud
        ? 'Cette transaction présente des caractéristiques associées à des fraudes connues.'
        : 'Cette transaction ne présente pas de signal de fraude évident.',
    };
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1200));
    setResult(simulatePrediction(form));
    setLoading(false);
  };

  const handleReset = () => { setForm(INITIAL_FORM); setResult(null); setErrors({}); };

  const riskColor = result
    ? result.riskLevel === 'HIGH' ? COLORS.fraud
      : result.riskLevel === 'MEDIUM' ? COLORS.accentOrange
      : COLORS.legitimate
    : COLORS.blue;

  const adornment = (icon: React.ReactNode) => ({
    input: { startAdornment: <InputAdornment position="start">{icon}</InputAdornment> },
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── Page header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{
          width: 44, height: 44, borderRadius: 2, backgroundColor: '#EEF2FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ShieldIcon sx={{ color: COLORS.blue, fontSize: 26 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1.2 }}>
            Détection de fraude
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Saisissez les caractéristiques d'une transaction pour évaluer son risque de fraude.
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" icon={<InfoIcon fontSize="small" />} sx={{ mb: 2, borderRadius: 2, py: 0.5 }}>
        Règles heuristiques provisoires — intégration ML (Scikit-learn / XGBoost) prévue via <code>/api/fraud/predict</code>.
      </Alert>

      {/* ── Two-column layout ── */}
      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>

        {/* ════ LEFT : Form ════ */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>

            {/* Card header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2.5, pb: 1.5 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: 2, backgroundColor: '#EEF2FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ReceiptLongIcon sx={{ color: COLORS.blue, fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  Information de la transaction
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Renseignez les champs requis pour analyser la transaction.
                </Typography>
              </Box>
            </Box>

            <Divider />

            <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>

              {/* Section 1 — Informations générales */}
              <Box sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
                <SectionHeader
                  icon={<ReceiptLongIcon fontSize="small" />}
                  title="Informations générales"
                  expanded={openGeneral}
                  onToggle={() => setOpenGeneral((v) => !v)}
                />
                <Collapse in={openGeneral}>
                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FieldLabel>TransactionAmt *</FieldLabel>
                        <TextField fullWidth size="small" placeholder="0.00"
                          value={form.transactionAmt} onChange={handleChange('transactionAmt')}
                          error={!!errors.transactionAmt} helperText={errors.transactionAmt}
                          type="number"
                          slotProps={{
                            htmlInput: { min: 0, step: '0.01' },
                            ...adornment(<AttachMoneyIcon fontSize="small" sx={{ color: 'text.secondary' }} />),
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FieldLabel>ProductCD *</FieldLabel>
                        <TextField fullWidth select size="small"
                          value={form.productCD} onChange={handleChange('productCD')}
                          error={!!errors.productCD} helperText={errors.productCD}>
                          <MenuItem value="" disabled>Sélectionner un produit</MenuItem>
                          {PRODUCT_OPTIONS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                        </TextField>
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </Box>

              {/* Section 2 — Informations de la carte */}
              <Box sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
                <SectionHeader
                  icon={<CreditCardIcon fontSize="small" />}
                  title="Informations de la carte"
                  expanded={openCard}
                  onToggle={() => setOpenCard((v) => !v)}
                />
                <Collapse in={openCard}>
                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      {(['card1', 'card2', 'card3'] as const).map((field, i) => (
                        <Grid key={field} size={{ xs: 12, sm: 4 }}>
                          <FieldLabel>{field} *</FieldLabel>
                          <TextField fullWidth size="small"
                            placeholder={`Ex: ${[1234, 56, 123][i]}`}
                            value={form[field]} onChange={handleChange(field)}
                            error={!!errors[field]} helperText={errors[field]}
                            type="number"
                            slotProps={adornment(<CreditCardIcon fontSize="small" sx={{ color: 'text.secondary' }} />)}
                          />
                        </Grid>
                      ))}
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FieldLabel>card4 *</FieldLabel>
                        <TextField fullWidth select size="small"
                          value={form.card4} onChange={handleChange('card4')}
                          error={!!errors.card4} helperText={errors.card4}>
                          <MenuItem value="" disabled>Type de carte</MenuItem>
                          {CARD4_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FieldLabel>card5 *</FieldLabel>
                        <TextField fullWidth size="small" placeholder="Ex: 30"
                          value={form.card5} onChange={handleChange('card5')}
                          error={!!errors.card5} helperText={errors.card5}
                          type="number"
                          slotProps={adornment(<CreditCardIcon fontSize="small" sx={{ color: 'text.secondary' }} />)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FieldLabel>card6 *</FieldLabel>
                        <TextField fullWidth select size="small"
                          value={form.card6} onChange={handleChange('card6')}
                          error={!!errors.card6} helperText={errors.card6}>
                          <MenuItem value="" disabled>Débit / Crédit</MenuItem>
                          {CARD6_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                        </TextField>
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </Box>

              {/* Section 3 — Informations d'adresse */}
              <Box sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
                <SectionHeader
                  icon={<LocationOnIcon fontSize="small" />}
                  title="Informations d'adresse"
                  expanded={openAddress}
                  onToggle={() => setOpenAddress((v) => !v)}
                />
                <Collapse in={openAddress}>
                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FieldLabel>addr1 *</FieldLabel>
                        <TextField fullWidth size="small" placeholder="Ex: 123"
                          value={form.addr1} onChange={handleChange('addr1')}
                          error={!!errors.addr1} helperText={errors.addr1}
                          type="number"
                          slotProps={adornment(<LocationOnIcon fontSize="small" sx={{ color: 'text.secondary' }} />)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FieldLabel>addr2 *</FieldLabel>
                        <TextField fullWidth size="small" placeholder="Ex: 5"
                          value={form.addr2} onChange={handleChange('addr2')}
                          error={!!errors.addr2} helperText={errors.addr2}
                          type="number"
                          slotProps={adornment(<LocationOnIcon fontSize="small" sx={{ color: 'text.secondary' }} />)}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </Box>

              {/* Section 4 — Informations complémentaires */}
              <Box sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
                <SectionHeader
                  icon={<SettingsIcon fontSize="small" />}
                  title="Informations complémentaires"
                  expanded={openExtra}
                  onToggle={() => setOpenExtra((v) => !v)}
                />
                <Collapse in={openExtra}>
                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FieldLabel>P_emaildomain</FieldLabel>
                        <TextField fullWidth select size="small"
                          value={form.pEmaildomain} onChange={handleChange('pEmaildomain')}>
                          <MenuItem value="">Sélectionner un domaine</MenuItem>
                          {EMAIL_DOMAINS.map((d) => (
                            <MenuItem key={d} value={d}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />{d}
                              </Box>
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FieldLabel>R_emaildomain</FieldLabel>
                        <TextField fullWidth select size="small"
                          value={form.rEmaildomain} onChange={handleChange('rEmaildomain')}>
                          <MenuItem value="">Sélectionner un domaine</MenuItem>
                          {EMAIL_DOMAINS.map((d) => (
                            <MenuItem key={d} value={d}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />{d}
                              </Box>
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                    <Alert severity="info" sx={{ mt: 2, borderRadius: 2, py: 0.5 }} icon={<InfoIcon fontSize="small" />}>
                      Plus de variables peuvent être requises selon le modèle ML.
                    </Alert>
                  </Box>
                </Collapse>
              </Box>
            </Box>

            {/* Action buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, p: 2, pt: 1 }}>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleReset}
                sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}>
                Réinitialiser
              </Button>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                onClick={handleSubmit}
                disabled={loading}
                sx={{
                  borderRadius: 2, textTransform: 'none', px: 3,
                  backgroundColor: COLORS.blue, '&:hover': { backgroundColor: '#1976D2' },
                }}
              >
                {loading ? 'Analyse en cours...' : 'Analyser la transaction'}
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* ════ RIGHT : Result panel ════ */}
        <Grid size={{ xs: 12, lg: 5 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>

            {/* Result header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2.5, pb: 1.5 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: 2, backgroundColor: '#EEF2FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ManageSearchIcon sx={{ color: COLORS.blue, fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  Résultat de l'analyse
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Le résultat s'affichera ici après l'analyse de la transaction.
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* Loading state */}
            {loading && (
              <Box sx={{ px: 3, pt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Analyse en cours...
                </Typography>
                <LinearProgress sx={{ borderRadius: 1 }} />
              </Box>
            )}

            {/* Empty state */}
            {!loading && !result && (
              <Box sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', p: 4, flex: 1,
              }}>
                <Box sx={{
                  width: 80, height: 80, borderRadius: '50%', backgroundColor: '#EEF2FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
                }}>
                  <ManageSearchIcon sx={{ color: COLORS.blue, fontSize: 40 }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  En attente d'analyse
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Veuillez remplir le formulaire et cliquer sur "Analyser la transaction"
                  pour obtenir le résultat.
                </Typography>
              </Box>
            )}

            {/* Result content */}
            {!loading && result && (
              <Box>
                {/* Color banner */}
                <Paper elevation={0} sx={{
                  mx: 2, mt: 2, borderRadius: 2, overflow: 'hidden',
                  border: `1px solid ${riskColor}`,
                }}>
                  <Box sx={{
                    backgroundColor: riskColor, p: 2,
                    display: 'flex', alignItems: 'center', gap: 1.5,
                  }}>
                    {result.isFraud
                      ? <WarningAmberIcon sx={{ color: '#fff', fontSize: 28 }} />
                      : <CheckCircleIcon sx={{ color: '#fff', fontSize: 28 }} />}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
                        {result.isFraud ? 'Transaction suspecte' : 'Transaction légitime'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                        {result.message}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={result.riskLevel === 'HIGH' ? 'ÉLEVÉ' : result.riskLevel === 'MEDIUM' ? 'MOYEN' : 'FAIBLE'}
                      sx={{ backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff', fontWeight: 700 }}
                    />
                  </Box>
                </Paper>

                {/* Score + details */}
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

                  {/* Score bar */}
                  <Box sx={{ backgroundColor: '#F9FAFB', borderRadius: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">Score de risque</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: riskColor }}>
                        {result.confidence} / 100
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={result.confidence}
                      sx={{
                        height: 8, borderRadius: 4,
                        backgroundColor: '#E5E7EB',
                        '& .MuiLinearProgress-bar': { backgroundColor: riskColor, borderRadius: 4 },
                      }}
                    />
                  </Box>

                  {/* KPI row */}
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ backgroundColor: '#F9FAFB', borderRadius: 2, p: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Verdict</Typography>
                        <Chip
                          size="small"
                          label={result.isFraud ? 'FRAUDE' : 'LÉGITIME'}
                          color={result.isFraud ? 'error' : 'success'}
                          sx={{ fontWeight: 700, mt: 0.5 }}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ backgroundColor: '#F9FAFB', borderRadius: 2, p: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Montant analysé</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5 }}>
                          ${Number(form.transactionAmt).toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ backgroundColor: '#F9FAFB', borderRadius: 2, p: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Produit</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5 }}>
                          {form.productCD || '—'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ backgroundColor: '#F9FAFB', borderRadius: 2, p: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Carte</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5, textTransform: 'capitalize' }}>
                          {form.card4 || '—'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Alert severity="warning" sx={{ borderRadius: 2, py: 0.5 }}>
                    Résultat heuristique provisoire. Intégrer un modèle ML pour des prédictions fiables.
                  </Alert>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FraudAnalysis;
