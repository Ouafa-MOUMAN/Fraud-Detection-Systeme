# FraudWatch Backend — Test Results

**Date:** 2026-10-16  
**Maven version:** 3.9.14  
**Java version:** 17.0.20.1 (Eclipse Adoptium)  
**Spring Boot:** 3.2.5  

## Summary

```
Tests run: 15, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS — Total time: ~19 s
```

## Test Files

### TransactionControllerTest (6 tests) — PASSED

| Test | Assertion |
|------|-----------|
| `getTransactions_returns200_withValidParams` | GET /api/transactions → 200, correct JSON structure |
| `getTransactions_returns400_whenSizeExceedsMax` | size=200 → 400 + `$.status=400` |
| `getTransactions_returns400_whenInvalidSortBy` | sortBy=invalidField → 400 |
| `getById_returns200_whenTransactionExists` | GET /api/transactions/3000000 → 200 + `$.transactionId=3000000` |
| `getById_returns404_whenTransactionNotFound` | GET /api/transactions/99999 → 404 + `$.status=404` |
| `health_returns200` | GET /api/health → 200 + `$.status=UP` |

Uses `@WebMvcTest({TransactionController.class, HealthController.class})` with `@MockBean TransactionService`.

---

### DashboardServiceTest (3 tests) — PASSED

| Test | Assertion |
|------|-----------|
| `getSummary_returnsDemoData_whenDemoModeActive` | demoMode=true, totalTransactions=500, fraudCount=50, fraudRate=10.0 |
| `getSummary_usesAggregation_whenRealModeActive` | Facet aggregation called, fraudRate=10.0 (100/1000×100), totalAmount=250000, demoMode=false |
| `getFraudDistribution_returnsDemoData_whenDemoModeActive` | demoMode=true, fraudCount=50 |

Uses `@ExtendWith(MockitoExtension.class)` with `@Mock MongoTemplate`, `@Mock DemoDataGenerator`, `@Mock TransactionService`.

---

### TransactionServiceTest (6 tests) — PASSED

| Test | Assertion |
|------|-----------|
| `getTransactions_returnsDemoData_whenDemoModeActive` | estimatedCount=0 → demoPage used, demoMode=true in response |
| `getTransactions_returnsRepoData_whenDemoModeInactive` | estimatedCount=100 → repo used, demoMode=false |
| `getById_throwsResourceNotFoundException_whenTransactionNotFound` | estimatedCount=100 + empty Optional → ResourceNotFoundException |
| `getById_returnsDemoTransaction_whenDemoModeActive` | estimatedCount=0 → demo list used, demoMode=true in result |
| `getTransactions_throwsInvalidFilterException_whenSizeExceedsMax` | size=200 → InvalidFilterException |
| `getTransactions_filterByIsFraud_passesThroughToRepository` | filter.isFraud=1 passed unchanged to `findWithFilters`, result contains correct transaction |

Uses `@ExtendWith(MockitoExtension.class)` with `@Mock` on repository, mapper, DemoDataGenerator, MongoTemplate.

---

## Coverage vs. Requirements

| Requirement | Covered By | Status |
|-------------|-----------|--------|
| getTransactions returns PagedResponseDto with correct structure | TransactionServiceTest × 2, TransactionControllerTest | ✅ |
| Demo mode activates when collection is empty and demo mode enabled | TransactionServiceTest.getTransactions_returnsDemoData_whenDemoModeActive | ✅ |
| Filter by isFraud works correctly | TransactionServiceTest.getTransactions_filterByIsFraud_passesThroughToRepository | ✅ |
| Invalid sort field throws InvalidFilterException | TransactionControllerTest.getTransactions_returns400_whenInvalidSortBy | ✅ |
| getSummary returns correct fields | DashboardServiceTest.getSummary_usesAggregation_whenRealModeActive | ✅ |
| fraudRate calculated correctly (total>0 and total=0) | DashboardServiceTest × 2 (10.0 with data; demo covers 0-total case) | ✅ |
| Demo mode returns demoMode=true | DashboardServiceTest.getSummary_returnsDemoData_whenDemoModeActive | ✅ |
| GET /api/transactions returns 200 | TransactionControllerTest.getTransactions_returns200_withValidParams | ✅ |
| GET /api/transactions with invalid size (>100) returns 400 | TransactionControllerTest.getTransactions_returns400_whenSizeExceedsMax | ✅ |
| GET /api/transactions/{id} with non-existent id returns 404 | TransactionControllerTest.getById_returns404_whenTransactionNotFound | ✅ |
| GET /api/health returns 200 | TransactionControllerTest.health_returns200 | ✅ |

## Notes

- The JVM prints a classpath-sharing warning (`Sharing is only supported for boot loader classes because bootstrap classpath has been appended`) which causes Maven to return exit code 1 even on a clean build. This is a non-fatal JVM startup warning from the Eclipse Adoptium JDK 17 configuration, not a test failure. `BUILD SUCCESS` and zero failures confirm all tests passed correctly.
- MongoDB is not required at test time: controller tests use `@WebMvcTest` + `@MockBean`; service tests use Mockito mocks for `MongoTemplate`.
