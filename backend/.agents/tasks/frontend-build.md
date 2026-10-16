# FraudWatch Frontend — Build Report

## Status
✅ **Build successful** — `npm run build` completes without errors.

## Project Location
`c:\Users\hp 830 G3\Desktop\Fraud_front`

## Stack
- React 19 + TypeScript (strict mode)
- Vite 8 with `@vitejs/plugin-react`
- MUI v9 + @mui/icons-material v9
- Recharts v3
- Axios v1
- React Router DOM v7
- React Hook Form v7 + Zod v4
- @hookform/resolvers v5

## Source Files Created

### Types (`src/types/`)
| File | Contents |
|------|----------|
| `api.ts` | `ApiError`, `PagedResponse<T>` |
| `transaction.ts` | `Transaction`, `TransactionDetail`, `TransactionFilter` |
| `dashboard.ts` | `DashboardSummary`, `TrendData`, `FraudDistribution`, `AmountBucket` |
| `monitoring.ts` | `MonitoringStatus` |

### API Layer (`src/api/`)
| File | Endpoints |
|------|-----------|
| `axiosInstance.ts` | Axios instance with base URL from `VITE_API_BASE_URL`, response error interceptor |
| `transactionApi.ts` | `GET /api/transactions`, `GET /api/transactions/{id}`, `GET /api/transactions/export` |
| `dashboardApi.ts` | `GET /api/dashboard/summary`, `/trends`, `/fraud-distribution` |
| `monitoringApi.ts` | `GET /api/monitoring/status` (measures response time) |

### Hooks (`src/hooks/`)
| File | Purpose |
|------|---------|
| `useAutoRefresh.ts` | Interval-based callback with cleanup on unmount |
| `useDashboard.ts` | Fetches summary + trends + distribution in parallel |
| `useTransactions.ts` | Fetches with filters, pagination, sorting |
| `useMonitoring.ts` | Fetches monitoring status |

### Common Components (`src/components/common/`)
- `KpiCard.tsx` — Card with title, value, icon, accent color
- `LoadingSpinner.tsx` — Centered CircularProgress
- `ErrorAlert.tsx` — Alert with retry button
- `EmptyState.tsx` — Empty data state with icon
- `DemoModeBanner.tsx` — Orange banner for demo mode

### Chart Components (`src/components/charts/`)
- `TransactionTrendChart.tsx` — LineChart (volume + fraud over time)
- `FraudDistributionChart.tsx` — PieChart (fraud / légitime / inconnu)
- `AmountDistributionChart.tsx` — BarChart (montant buckets)

### Layout (`src/components/layout/`)
- `Sidebar.tsx` — Dark sidebar (#1A2035), active route highlighting
- `TopBar.tsx` — Fixed AppBar with page title and profile icon
- `MainLayout.tsx` — Sidebar + TopBar + content area

### Pages
| Page | Route | Features |
|------|-------|---------|
| `Dashboard.tsx` | `/` | 6 KPIs, 3 charts, recent tx table, pipeline status, auto-refresh 30s |
| `Transactions.tsx` | `/transactions` | Filter form, sortable table, pagination, export CSV |
| `TransactionDetail.tsx` | `/transactions/:id` | All transaction fields grouped by category |
| `FraudAnalysis.tsx` | `/fraud-analysis` | 3 KPIs, 2 comparison charts, top-10 fraud table |
| `Monitoring.tsx` | `/monitoring` | DB status, doc count, response time, errors, auto-refresh 10s |
| `NotFound.tsx` | `*` | 404 with back link |

## Environment Configuration
Copy `.env.example` to `.env` and set `VITE_API_BASE_URL`:
```
VITE_API_BASE_URL=http://localhost:8080
```

## MUI v9 Compatibility Notes
- `fontWeight` on `<Typography>` must go inside `sx` prop
- `primaryTypographyProps` on `ListItemText` replaced with `slotProps.primary`
- `InputLabelProps` on `TextField` replaced with `slotProps.inputLabel`
- `titleTypographyProps` on `CardHeader` replaced with JSX title node
- `Stack.flexWrap` + `useFlexGap` replaced with `Box sx={{ display: 'flex', flexWrap: 'wrap' }}`
- Recharts Tooltip `formatter` parameter typed as `unknown` (not `number`)

## Build Output
```
dist/index.html                              0.79 kB
dist/assets/index-D6YWrePn.js             318.82 kB (gzip: 100.84 kB)
dist/assets/BarChart-Bc6MNeq2.js          372.84 kB (gzip: 107.54 kB)
✓ 1584 modules transformed, built in 1.75s
```

## Git
Committed as: `feat: complete FraudWatch React TypeScript frontend`
