# FraudWatch — Implementation Plan

## Key Design Decisions

### 1. Demo Mode Strategy
When `app.demo-mode.enabled=true` and the MongoDB `transactions` collection is empty, every service method checks the count first (one `estimatedDocumentCount()` call, cached for 60 s via a simple `volatile long` field to avoid hitting Mongo on every request). If zero, it delegates to a `DemoDataGenerator` class that uses `java.util.Random` with a fixed seed (`42L`) to produce realistic but reproducible data. Demo payloads are **never persisted**; they are generated in memory and returned with a `demoMode: true` field in every response DTO. The frontend reads that flag and shows a `DemoModeBanner`.

### 2. MongoDB Aggregation Pipeline Shapes

**Dashboard summary** (`DashboardService.getSummary`):
```
db.transactions.aggregate([
  { $facet: {
      total:      [{ $count: "n" }],
      fraud:      [{ $match: { isFraud: 1 } }, { $count: "n" }],
      legit:      [{ $match: { isFraud: 0 } }, { $count: "n" }],
      totalAmt:   [{ $group: { _id: null, sum: { $sum: "$TransactionAmt" } } }],
      recent24h:  [{ $match: { TransactionDT: { $gte: <now-86400> } } }, { $count: "n" }]
  }}
])
```

**Transaction trends — hourly** (`DashboardService.getTrends(period=hourly)`):
```
db.transactions.aggregate([
  { $bucketAuto: {
      groupBy: "$TransactionDT",
      buckets: 24,
      output: { count: { $sum: 1 }, fraudCount: { $sum: "$isFraud" } }
  }}
])
```
For `period=daily` use 30 buckets.

**Fraud distribution**:
```
db.transactions.aggregate([
  { $group: {
      _id: "$isFraud",
      count: { $sum: 1 },
      avgAmt: { $avg: "$TransactionAmt" },
      totalAmt: { $sum: "$TransactionAmt" }
  }}
])
```

**Amount distribution (histogram)** — used by the frontend chart:
```
db.transactions.aggregate([
  { $bucket: {
      groupBy: "$TransactionAmt",
      boundaries: [0, 50, 100, 200, 500, 1000, 5000, 999999],
      default: "other",
      output: { count: { $sum: 1 } }
  }}
])
```

### 3. Spring Security Permissive Config
`SecurityConfig` uses `SecurityFilterChain` bean that calls `http.csrf(AbstractHttpConfigurer::disable)` and `http.authorizeHttpRequests(a -> a.anyRequest().permitAll())`. No `UserDetailsService` bean, no login form. A comment marks the exact location to add JWT or OAuth2 in v2.

### 4. Sort Whitelist
`TransactionRepositoryImpl` defines a `static final Set<String> ALLOWED_SORT_FIELDS = Set.of("transactionDT", "transactionAmt", "transactionId", "isFraud")`. Any `sortBy` value not in this set throws `InvalidFilterException` before a `Sort` object is constructed.

### 5. Frontend Component Hierarchy and Data Flow
```
App (Router)
└── MainLayout (Sidebar + TopBar)
    ├── Dashboard
    │   uses: useDashboard() → dashboardApi → GET /api/dashboard/summary
    │                                        → GET /api/dashboard/transaction-trends
    │                                        → GET /api/dashboard/fraud-distribution
    │   renders: KpiCard ×6, TransactionTrendChart, FraudDistributionChart,
    │            AmountDistributionChart, recent-transactions mini-table, DemoModeBanner
    ├── Transactions
    │   uses: useTransactions(filters) → transactionApi → GET /api/transactions
    │   renders: filter form (React Hook Form + Zod), MUI DataGrid-like table,
    │            pagination, export CSV button
    ├── FraudAnalysis
    │   uses: useDashboard() (reuses fraud-distribution endpoint)
    │   renders: KpiCard ×2, FraudDistributionChart, AmountDistributionChart
    ├── Monitoring
    │   uses: useMonitoring() → monitoringApi → GET /api/monitoring/status
    │         useAutoRefresh(10_000)
    │   renders: status cards, response-time indicator, last-import badge
    └── TransactionDetail (route /transactions/:id)
        uses: transactionApi.getById(id) → GET /api/transactions/{id}
        renders: detail card with all available fields
```

All filters and pagination live in URL search params (React Router `useSearchParams`). The `useTransactions` hook reads them, builds the query object, and calls the API. No in-memory filtering.

Auto-refresh is implemented in `useAutoRefresh(intervalMs)` which calls `setInterval` and returns a cleanup function registered with `useEffect`'s return. Dashboard uses 30 000 ms, Monitoring uses 10 000 ms.

---

## Implementation Plan

- [ ] 1. **Bootstrap the Spring Boot project (pom.xml + main class)**
      Create `pom.xml` with `spring-boot-starter-parent 3.2.5`, dependencies: `spring-boot-starter-web`, `spring-boot-starter-data-mongodb`, `spring-boot-starter-security`, `spring-boot-starter-validation`, `lombok`, `mapstruct 1.5.5.Final`, `springdoc-openapi-starter-webmvc-ui 2.3.0`, test scope `spring-boot-starter-test`. Create `FraudwatchApplication.java` in package `com.fraudwatch.backend`.
      Files: `c:\Users\hp 830 G3\Desktop\Fraud_backend\pom.xml`, `src\main\java\com\fraudwatch\backend\FraudwatchApplication.java`
      Verify: `cd "c:\Users\hp 830 G3\Desktop\Fraud_backend" && mvn compile -q` — BUILD SUCCESS.

- [ ] 2. **Application properties**
      Create `application.properties` with `spring.data.mongodb.uri=mongodb://localhost:27017/fraudwatch`, `spring.data.mongodb.database=fraudwatch`, `server.port=8080`, `app.demo-mode.enabled=true`, `app.page.max-size=100`. Create `application-demo.properties` (empty placeholder — demo logic is driven by the property above, not a profile, to keep activation simple).
      Files: `src\main\resources\application.properties`, `src\main\resources\application-demo.properties`
      Verify: `mvn compile -q` still passes; no property binding errors.

- [ ] 3. **Exception classes and GlobalExceptionHandler**
      Create `ResourceNotFoundException` (extends `RuntimeException`), `InvalidFilterException` (extends `RuntimeException`). Create `ApiErrorDto` record with fields `timestamp`, `status`, `error`, `message`, `path`. Create `GlobalExceptionHandler` (`@RestControllerAdvice`) mapping those two exceptions plus `MethodArgumentNotValidException` and generic `Exception` to JSON `ApiErrorDto` responses (404, 400, 400, 500).
      Files: `src\main\java\com\fraudwatch\backend\exception\ResourceNotFoundException.java`, `InvalidFilterException.java`, `src\main\java\com\fraudwatch\backend\dto\ApiErrorDto.java`, `src\main\java\com\fraudwatch\backend\exception\GlobalExceptionHandler.java`
      Verify: `mvn compile -q`.

- [ ] 4. **Transaction document and all DTOs**
      Create `Transaction.java` (`@Document(collection="transactions")`) with fields: `String id`, `long transactionId`, `Integer isFraud`, `Double transactionAmt`, `Long transactionDT`, `String productCD`, `String card4`, `String card6`, `String pEmailDomain`, `String rEmailDomain`, `Double dist1`. Annotate `transactionId` with `@Indexed(unique=true)`. Create all DTOs: `TransactionDto`, `TransactionDetailDto`, `TransactionFilterDto`, `DashboardSummaryDto`, `TrendDataDto`, `FraudDistributionDto`, `MonitoringStatusDto`, `PagedResponseDto<T>`.
      - `PagedResponseDto<T>`: fields `content`, `page`, `size`, `totalElements`, `totalPages`, `demoMode`.
      - `DashboardSummaryDto`: `totalTransactions`, `fraudTransactions`, `legitTransactions`, `fraudRate`, `totalAmount`, `recentTransactions24h`, `demoMode`.
      - `MonitoringStatusDto`: `documentCount`, `dbStatus` (UP/DOWN), `lastRefresh`, `responseTimeMs`, `demoMode`.
      Files: `document\Transaction.java`, `dto\*.java` (all eight DTOs listed above)
      Verify: `mvn compile -q`.

- [ ] 5. **MongoConfig and index creation**
      Create `MongoConfig.java` (`@Configuration`) implementing `MongoConfigurationSupport` (or using `MongoCustomConversions` bean). Add a `@EventListener(ApplicationReadyEvent.class)` method `ensureIndexes()` that creates: unique index on `transactionId`, single-field indexes on `isFraud`, `transactionAmt`, `transactionDT` using `MongoTemplate` and `IndexOperations`. This is idempotent — `ensureIndex` is safe to call repeatedly.
      Files: `src\main\java\com\fraudwatch\backend\config\MongoConfig.java`
      Verify: `mvn compile -q`; on a running Mongo, indexes appear in `db.transactions.getIndexes()`.

- [ ] 6. **CorsConfig and SecurityConfig**
      `CorsConfig.java`: `@Bean CorsConfigurationSource` allowing origin `http://localhost:5173`, all standard methods, all headers, credentials false. `SecurityConfig.java`: `@Bean SecurityFilterChain` — disable CSRF, permit all requests, add the CORS source.
      Files: `config\CorsConfig.java`, `config\SecurityConfig.java`
      Verify: `mvn compile -q`.

- [ ] 7. **TransactionMapper**
      Create `TransactionMapper.java` as a plain `@Component` (not MapStruct interface, to stay explicit). Methods: `toDto(Transaction)→TransactionDto`, `toDetailDto(Transaction)→TransactionDetailDto`. All field assignments explicit — no magic. This avoids a MapStruct annotation-processor setup issue on first compile.
      Files: `mapper\TransactionMapper.java`
      Verify: `mvn compile -q`.

- [ ] 8. **TransactionRepository interfaces**
      Create `TransactionRepository` extending `MongoRepository<Transaction, String>` with `Optional<Transaction> findByTransactionId(long id)`. Create `TransactionRepositoryCustom` interface with `Page<Transaction> findWithFilters(TransactionFilterDto filter, Pageable pageable)` and `List<Transaction> findForExport(TransactionFilterDto filter)`. Create `TransactionRepositoryImpl` implementing `TransactionRepositoryCustom` and injecting `MongoTemplate`. Implement filter building: add `Criteria` for `minAmt`/`maxAmt` (if non-null), `isFraud` (if non-null), `transactionId` exact match (if non-null/non-blank). Sort whitelist enforced here before building `Sort`. Use `mongoTemplate.find(query, Transaction.class)` and `mongoTemplate.count(countQuery, Transaction.class)` to construct `PageImpl`.
      Files: `repository\TransactionRepository.java`, `TransactionRepositoryCustom.java`, `TransactionRepositoryImpl.java`
      Verify: `mvn compile -q`.

- [ ] 9. **DemoDataGenerator utility**
      Create `DemoDataGenerator.java` (`@Component`) that holds a fixed `Random(42L)`. Provide methods:
      - `List<Transaction> generateTransactions(int count)` — returns synthetic transactions with realistic `transactionAmt` (log-normal), `isFraud` (10 % probability), `transactionDT` spread over the last 30 days relative to boot time.
      - `DashboardSummaryDto generateSummary()` — computes summary from the fixed list.
      - `Page<Transaction> pageTransactions(List<Transaction> all, TransactionFilterDto filter, Pageable pageable)` — applies filters in-memory (acceptable because demo data is small: 500 records max) and returns a `PageImpl`.
      The full demo list is built once at construction time and stored in a `final List<Transaction>` field. No Mongo access.
      Files: `src\main\java\com\fraudwatch\backend\config\DemoDataGenerator.java`
      Verify: `mvn compile -q`.

- [ ] 10. **TransactionService**
      Inject `TransactionRepository`, `TransactionRepositoryCustom`, `TransactionMapper`, `DemoDataGenerator`, `MongoTemplate`, and `@Value("${app.demo-mode.enabled:false}") boolean demoModeEnabled`. Cache the demo-trigger check with a `volatile Boolean isDemoActive` field initialized lazily: on first call, count documents; if 0 and `demoModeEnabled`, set `true`. Methods:
      - `PagedResponseDto<TransactionDto> getTransactions(TransactionFilterDto filter, int page, int size)` — validate page/size (throw `InvalidFilterException` if size > 100), delegate to repo or demo.
      - `TransactionDetailDto getById(long transactionId)` — repo lookup or demo lookup, throw `ResourceNotFoundException` if absent.
      - `List<Transaction> getForExport(TransactionFilterDto filter)` — cap at 10 000 rows, return raw list for CSV serialization.
      Files: `service\TransactionService.java`
      Verify: `mvn compile -q`.

- [ ] 11. **DashboardService**
      Inject `MongoTemplate`, `DemoDataGenerator`, demo flags (same pattern as TransactionService). Methods:
      - `DashboardSummaryDto getSummary()` — runs the `$facet` aggregation described in Design Decision 2; maps result to DTO.
      - `List<TrendDataDto> getTrends(String period)` — runs `$bucketAuto` with 24 or 30 buckets; maps to list of `{label, count, fraudCount}`.
      - `List<FraudDistributionDto> getFraudDistribution()` — runs the `$group` aggregation; maps to list of `{label, count, avgAmt, totalAmt}`.
      All aggregations run via `mongoTemplate.aggregate(Aggregation.newAggregation(...), Transaction.class, Document.class)` then map manually.
      Files: `service\DashboardService.java`
      Verify: `mvn compile -q`.

- [ ] 12. **MonitoringService**
      Inject `MongoTemplate`, application start time (`Instant.now()` captured in constructor). `getStatus()`: call `mongoTemplate.executeCommand("{ping:1}")` wrapped in try/catch to determine `dbStatus`; count documents; measure response time with `System.currentTimeMillis()`; return `MonitoringStatusDto`.
      Files: `service\MonitoringService.java`
      Verify: `mvn compile -q`.

- [ ] 13. **Controllers**
      Create four controllers all annotated `@RestController @RequestMapping @Validated`:
      - `HealthController` — `GET /api/health` returns `{status:"UP", timestamp}`.
      - `TransactionController` — `GET /api/transactions` (bind filter params with `@RequestParam` + defaults), `GET /api/transactions/{transactionId}`, `GET /api/transactions/export` (streams CSV using `HttpServletResponse` writer, sets `Content-Disposition` header).
      - `DashboardController` — `GET /api/dashboard/summary`, `/transaction-trends?period=`, `/fraud-distribution`.
      - `MonitoringController` — `GET /api/monitoring/status`.
      CSV export: use `opencsv` (add to pom.xml) or hand-write with `PrintWriter`: `transactionId,transactionAmt,isFraud,transactionDT,productCD`.
      Files: `controller\HealthController.java`, `TransactionController.java`, `DashboardController.java`, `MonitoringController.java`
      Verify: `mvn package -q -DskipTests` — JAR produced; `java -jar target/*.jar` starts without errors on a machine with Mongo running (or demo mode kicks in).

- [ ] 14. **Unit tests — backend**
      Write three test classes:
      - `TransactionServiceTest` — mock `TransactionRepositoryCustom` and `DemoDataGenerator`; test `getTransactions` returns demo data when demo active, returns repo data otherwise; test `getById` throws `ResourceNotFoundException`.
      - `DashboardServiceTest` — mock `MongoTemplate`; test that `getSummary()` maps the `$facet` result to correct DTO fields.
      - `TransactionControllerTest` — `@WebMvcTest(TransactionController.class)` with mocked service; test 200 on valid request, 400 on invalid size > 100, 404 on unknown transactionId.
      Files: `src\test\java\com\fraudwatch\backend\service\TransactionServiceTest.java`, `DashboardServiceTest.java`, `src\test\java\com\fraudwatch\backend\controller\TransactionControllerTest.java`
      Verify: `mvn test` — all tests green.

- [ ] 15. **Backend README and .gitignore**
      Create `README.md` documenting build (`mvn package`), run (`java -jar`), env vars, demo mode, MongoDB setup, and index creation. Create `.gitignore` excluding `target/`, `*.class`, `.env`, IDE folders.
      Files: `c:\Users\hp 830 G3\Desktop\Fraud_backend\README.md`, `.gitignore`
      Verify: no build step needed.

---

## Frontend Implementation Plan

- [ ] 16. **Initialize Vite project and install dependencies**
      Run in `c:\Users\hp 830 G3\Desktop\Fraud_front`:
      ```
      npm create vite@latest . -- --template react-ts
      npm install @mui/material@5.15.14 @emotion/react@11.11.4 @emotion/styled@11.11.5 ^
        @mui/icons-material@5.15.14 recharts@2.12.3 axios@1.6.8 ^
        react-router-dom@6.22.3 react-hook-form@7.51.2 zod@3.22.4 @hookform/resolvers@3.3.4
      ```
      Pin exact versions to avoid drift. Delete the Vite template boilerplate (`src/App.css`, `src/assets/react.svg`, contents of `App.tsx`).
      Files: `c:\Users\hp 830 G3\Desktop\Fraud_front\package.json`, `vite.config.ts`
      Verify: `npm run build` — no TypeScript or build errors.

- [ ] 17. **Types**
      Create all TypeScript interfaces:
      - `transaction.ts`: `Transaction`, `TransactionDetail`, `TransactionFilter`, `PagedResponse<T>`.
      - `dashboard.ts`: `DashboardSummary`, `TrendData`, `FraudDistribution`.
      - `monitoring.ts`: `MonitoringStatus`.
      - `api.ts`: `ApiError`, `ApiResponse<T>`.
      Use `?` for optional fields that may be absent when real data lacks them.
      Files: `src\types\transaction.ts`, `dashboard.ts`, `monitoring.ts`, `api.ts`
      Verify: `npm run build` — no TS errors.

- [ ] 18. **Utils: formatters and constants**
      `formatters.ts`: `formatCurrency(n)`, `formatDate(epochSeconds)`, `formatPercent(n)`, `formatNumber(n)`. `constants.ts`: `API_BASE_URL`, `PAGE_SIZE_DEFAULT=20`, `REFRESH_DASHBOARD_MS=30000`, `REFRESH_MONITORING_MS=10000`, fraud color map.
      Files: `src\utils\formatters.ts`, `src\utils\constants.ts`
      Verify: `npm run build`.

- [ ] 19. **Axios instance and API modules**
      `axiosInstance.ts`: `axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080' })` with request/response interceptors that normalize errors to `ApiError`. `transactionApi.ts`: `getTransactions(filter, page, size)`, `getById(id)`, `exportCsv(filter)`. `dashboardApi.ts`: `getSummary()`, `getTrends(period)`, `getFraudDistribution()`. `monitoringApi.ts`: `getStatus()`.
      Files: `src\api\axiosInstance.ts`, `transactionApi.ts`, `dashboardApi.ts`, `monitoringApi.ts`
      Verify: `npm run build`.

- [ ] 20. **Hooks**
      `useDashboard.ts`: fetches summary + trends + fraud distribution in `Promise.all`; returns `{data, loading, error, refresh}`. `useTransactions.ts`: accepts filter object, fetches paged transactions, returns `{data, loading, error}`. `useMonitoring.ts`: fetches monitoring status, returns `{data, loading, error, refresh}`. `useAutoRefresh.ts`: takes `(callback: () => void, intervalMs: number, enabled: boolean)` — calls `callback` immediately, then sets up `setInterval`; clears on unmount via `useEffect` cleanup.
      Files: `src\hooks\useDashboard.ts`, `useTransactions.ts`, `useMonitoring.ts`, `useAutoRefresh.ts`
      Verify: `npm run build`.

- [ ] 21. **Common components**
      - `KpiCard.tsx`: MUI `Card` with icon slot, title, value, subtitle, optional trend arrow. Props: `title`, `value`, `subtitle?`, `icon`, `color?`, `loading?`.
      - `LoadingSpinner.tsx`: centered MUI `CircularProgress`.
      - `ErrorAlert.tsx`: MUI `Alert severity="error"` with message and optional retry button.
      - `EmptyState.tsx`: icon + heading + body text for zero-results states.
      - `DemoModeBanner.tsx`: MUI `Alert severity="warning"` sticky at top, shown when any response has `demoMode:true`.
      Files: `src\components\common\*.tsx` (five files)
      Verify: `npm run build`.

- [ ] 22. **Chart components**
      - `TransactionTrendChart.tsx`: Recharts `ComposedChart` (bar for count, line for fraudCount) with `ResponsiveContainer`, `XAxis` (label), `YAxis`, `Tooltip`, `Legend`.
      - `FraudDistributionChart.tsx`: Recharts `PieChart` with two slices (fraud / legit), `Tooltip`, `Legend`, center label for fraud rate.
      - `AmountDistributionChart.tsx`: Recharts `BarChart` with buckets on X axis and count on Y axis.
      All charts must handle empty/loading states gracefully.
      Files: `src\components\charts\*.tsx` (three files)
      Verify: `npm run build`.

- [ ] 23. **Layout components**
      - `Sidebar.tsx`: MUI `Drawer` (persistent, width 240 px) with `List` items for Dashboard, Transactions, Fraud Analysis, Monitoring. Active item highlighted using `useLocation`. Icons from `@mui/icons-material`.
      - `TopBar.tsx`: MUI `AppBar` with page title (read from a `title` prop), search `TextField`, and avatar/profile chip (static, no auth in v1).
      - `MainLayout.tsx`: wraps `Outlet` (React Router) with `Sidebar` + `TopBar`, main content area with correct left margin (240 px) and top padding (64 px).
      Files: `src\components\layout\Sidebar.tsx`, `TopBar.tsx`, `MainLayout.tsx`
      Verify: `npm run build`.

- [ ] 24. **Dashboard page**
      Use `useDashboard()` and `useAutoRefresh(refresh, REFRESH_DASHBOARD_MS, true)`. Render:
      - `DemoModeBanner` if `demoMode`.
      - Six `KpiCard` components (total transactions, fraud count, legit count, fraud rate %, total amount, recent 24 h).
      - `TransactionTrendChart` (pass trends data).
      - `FraudDistributionChart` (pass distribution data).
      - `AmountDistributionChart` (derived from summary or a separate endpoint — use fraud distribution data here; add amount distribution endpoint to backend plan if missing — it is covered by the `$bucket` aggregation in DashboardService).
      - Recent transactions mini-table (last 5, fetched via `transactionApi.getTransactions({}, 0, 5)`).
      Show `LoadingSpinner` while loading, `ErrorAlert` on error.
      Files: `src\pages\Dashboard.tsx`
      Verify: `npm run build`; page renders in browser.

- [ ] 25. **Transactions page**
      Use React Hook Form + Zod for the filter form (schema: `minAmt?: number ≥ 0`, `maxAmt?: number > 0`, `isFraud?: 0|1`, `transactionId?: string`, `page: number`, `size: number 1–100`). On submit, push filters to URL search params. `useTransactions` reads search params and fetches. Render MUI `Table` with columns: TransactionID, Amount, DT, isFraud badge, ProductCD. MUI `TablePagination` at bottom. Each row clickable → navigate to `/transactions/:id`. "Export CSV" button calls `transactionApi.exportCsv(filter)` and triggers browser download. "Reset" button clears form and params.
      Files: `src\pages\Transactions.tsx`
      Verify: `npm run build`; filters and pagination visible.

- [ ] 26. **Transaction Detail page**
      Read `:transactionId` from route params, call `transactionApi.getById(id)`. Render a two-column MUI `Grid` of labeled fields. Back button (← Transactions). Show all `TransactionDetail` fields including supplementary ones. Show `ErrorAlert` + back button on 404.
      Files: `src\pages\TransactionDetail.tsx`
      Verify: `npm run build`.

- [ ] 27. **Fraud Analysis page**
      Reuse `useDashboard()` data. Render:
      - Two KpiCards (fraud count, fraud rate).
      - `FraudDistributionChart`.
      - `AmountDistributionChart` for fraudulent transactions (if backend provides separate breakdown — otherwise use combined distribution with fraud filter note).
      - Disclaimer box: "isFraud is a historical label from the training dataset, not a real-time model prediction."
      - "ML Integration Ready" placeholder card showing where a future scoring model will appear.
      Files: `src\pages\FraudAnalysis.tsx`
      Verify: `npm run build`.

- [ ] 28. **Monitoring page**
      Use `useMonitoring()` and `useAutoRefresh(refresh, REFRESH_MONITORING_MS, true)`. Render:
      - Status card: DB UP/DOWN with color indicator.
      - Document count card.
      - Last refresh timestamp.
      - Response time badge (green < 100 ms, yellow 100–500 ms, red > 500 ms).
      - `DemoModeBanner` if demo mode.
      Note: no Kafka/Spark metrics — as specified.
      Files: `src\pages\Monitoring.tsx`
      Verify: `npm run build`.

- [ ] 29. **NotFound page, App.tsx routing, main.tsx**
      `NotFound.tsx`: centered 404 illustration + "Back to Dashboard" button. `App.tsx`: `BrowserRouter` → `Routes` with `<Route path="/" element={<MainLayout/>}><Route index element={<Dashboard/>}/>` etc., `<Route path="*" element={<NotFound/>}/>`. `main.tsx`: `ReactDOM.createRoot` with MUI `ThemeProvider` (custom theme: primary `#1a237e` deep blue, secondary `#ff6f00` amber-orange, background `#f5f6fa`).
      Files: `src\App.tsx`, `src\main.tsx`, `src\pages\NotFound.tsx`
      Verify: `npm run build` — zero errors; `npm run dev` — app loads at localhost:5173.

- [ ] 30. **Environment file and frontend .gitignore**
      `.env.example`: `VITE_API_BASE_URL=http://localhost:8080`. `.gitignore`: `node_modules/`, `dist/`, `.env`, `.env.local`.
      Files: `c:\Users\hp 830 G3\Desktop\Fraud_front\.env.example`, `.gitignore`
      Verify: `npm run build` still passes.

- [ ] 31. **End-to-end smoke test (manual)**
      Start backend (`mvn spring-boot:run -Dspring-boot.run.profiles=` — demo mode enabled by default). Start frontend (`npm run dev`). Verify:
      1. Dashboard loads with demo data banner.
      2. KPI cards show non-zero values.
      3. Charts render without console errors.
      4. Transactions page shows table with pagination.
      5. Clicking a row opens Transaction Detail with full field list.
      6. Fraud Analysis page loads charts and disclaimer.
      7. Monitoring page shows DB UP (even in demo mode) and refreshes every 10 s.
      8. `/unknown` route shows NotFound page.
      Verify: All 8 checks pass visually; no 500 errors in backend console.

---

## Build Reference

| Step | Command | Expected outcome |
|------|---------|-----------------|
| Backend compile | `cd Fraud_backend && mvn compile -q` | BUILD SUCCESS |
| Backend test | `cd Fraud_backend && mvn test` | All tests green |
| Backend package | `cd Fraud_backend && mvn package -q -DskipTests` | JAR in `target/` |
| Backend run | `java -jar target/fraudwatch-backend-*.jar` | Started on port 8080 |
| Frontend install | `cd Fraud_front && npm install` | No peer warnings |
| Frontend build | `cd Fraud_front && npm run build` | `dist/` produced |
| Frontend dev | `cd Fraud_front && npm run dev` | localhost:5173 |
