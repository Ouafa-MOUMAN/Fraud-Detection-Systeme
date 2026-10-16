package com.fraudwatch.backend.service;

import com.fraudwatch.backend.config.DemoDataGenerator;
import com.fraudwatch.backend.document.Transaction;
import com.fraudwatch.backend.dto.DashboardSummaryDto;
import com.fraudwatch.backend.dto.FraudDistributionDto;
import org.bson.Document;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private MongoTemplate mongoTemplate;

    @Mock
    private DemoDataGenerator demoDataGenerator;

    @Mock
    private TransactionService transactionService;

    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        dashboardService = new DashboardService(mongoTemplate, demoDataGenerator, transactionService);
        ReflectionTestUtils.setField(dashboardService, "demoModeEnabled", true);
    }

    @Test
    void getSummary_returnsDemoData_whenDemoModeActive() {
        when(transactionService.isDemoMode()).thenReturn(true);

        DashboardSummaryDto expected = new DashboardSummaryDto();
        expected.setTotalTransactions(500L);
        expected.setFraudCount(50L);
        expected.setLegitimateCount(450L);
        expected.setFraudRate(10.0);
        expected.setDemoMode(true);

        when(demoDataGenerator.generateSummary()).thenReturn(expected);

        DashboardSummaryDto result = dashboardService.getSummary();

        assertTrue(result.isDemoMode());
        assertEquals(500L, result.getTotalTransactions());
        assertEquals(50L, result.getFraudCount());
        assertEquals(10.0, result.getFraudRate(), 0.001);
        verify(mongoTemplate, never()).aggregate(any(Aggregation.class), eq(Transaction.class), eq(Document.class));
    }

    @Test
    void getSummary_usesAggregation_whenRealModeActive() {
        when(transactionService.isDemoMode()).thenReturn(false);

        // Build a mock facet result
        Document fraudDoc = new Document("n", 100);
        Document legitDoc = new Document("n", 900);
        Document totalDoc = new Document("n", 1000);
        Document amtDoc = new Document("sum", 250000.0);

        Document facetResult = new Document()
                .append("total", List.of(totalDoc))
                .append("fraud", List.of(fraudDoc))
                .append("legit", List.of(legitDoc))
                .append("totalAmt", List.of(amtDoc));

        @SuppressWarnings("unchecked")
        AggregationResults<Document> mockResults = mock(AggregationResults.class);
        when(mockResults.getUniqueMappedResult()).thenReturn(facetResult);
        when(mongoTemplate.aggregate(any(Aggregation.class), eq(Transaction.class), eq(Document.class)))
                .thenReturn(mockResults);

        DashboardSummaryDto result = dashboardService.getSummary();

        assertFalse(result.isDemoMode());
        assertEquals(1000L, result.getTotalTransactions());
        assertEquals(100L, result.getFraudCount());
        assertEquals(900L, result.getLegitimateCount());
        // fraudRate = 100 / (100+900) * 100 = 10.0
        assertEquals(10.0, result.getFraudRate(), 0.001);
        assertEquals(250000.0, result.getTotalAmount(), 0.001);
    }

    @Test
    void getFraudDistribution_returnsDemoData_whenDemoModeActive() {
        when(transactionService.isDemoMode()).thenReturn(true);

        FraudDistributionDto expected = new FraudDistributionDto();
        expected.setFraudCount(50L);
        expected.setLegitimateCount(450L);
        expected.setFraudRate(10.0);
        expected.setDemoMode(true);

        when(demoDataGenerator.generateFraudDistribution()).thenReturn(expected);

        FraudDistributionDto result = dashboardService.getFraudDistribution();

        assertTrue(result.isDemoMode());
        assertEquals(50L, result.getFraudCount());
    }
}
