package com.fraudwatch.backend.service;

import com.fraudwatch.backend.config.DemoDataGenerator;
import com.fraudwatch.backend.document.Transaction;
import com.fraudwatch.backend.dto.DashboardSummaryDto;
import com.fraudwatch.backend.dto.FraudDistributionDto;
import com.fraudwatch.backend.dto.TrendDataDto;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardService {

    private static final Logger log = LoggerFactory.getLogger(DashboardService.class);

    private final MongoTemplate mongoTemplate;
    private final DemoDataGenerator demoDataGenerator;
    private final TransactionService transactionService;

    @Value("${app.demo-mode.enabled:false}")
    private boolean demoModeEnabled;

    public DashboardService(MongoTemplate mongoTemplate,
                             DemoDataGenerator demoDataGenerator,
                             TransactionService transactionService) {
        this.mongoTemplate = mongoTemplate;
        this.demoDataGenerator = demoDataGenerator;
        this.transactionService = transactionService;
    }

    public DashboardSummaryDto getSummary() {
        if (transactionService.isDemoMode()) {
            return demoDataGenerator.generateSummary();
        }

        try {
            // $facet aggregation to compute all KPIs in a single pass
            AggregationOperation facet = context -> new Document("$facet", new Document()
                .append("total", List.of(new Document("$count", "n")))
                .append("fraud", List.of(
                    new Document("$match", new Document("isFraud", 1)),
                    new Document("$count", "n")))
                .append("legit", List.of(
                    new Document("$match", new Document("isFraud", 0)),
                    new Document("$count", "n")))
                .append("totalAmt", List.of(
                    new Document("$group", new Document("_id", (Object) null)
                        .append("sum", new Document("$sum", "$transactionAmt")))))
            );

            Aggregation agg = Aggregation.newAggregation(facet);
            AggregationResults<Document> results =
                    mongoTemplate.aggregate(agg, Transaction.class, Document.class);
            Document raw = results.getUniqueMappedResult();

            DashboardSummaryDto dto = new DashboardSummaryDto();
            if (raw != null) {
                dto.setTotalTransactions(extractCount(raw, "total"));
                dto.setFraudCount(extractCount(raw, "fraud"));
                dto.setLegitimateCount(extractCount(raw, "legit"));
                double totalAmt = extractSum(raw, "totalAmt");
                dto.setTotalAmount(totalAmt);
                long total = dto.getTotalTransactions();
                long fraud = dto.getFraudCount();
                long labeled = fraud + dto.getLegitimateCount();
                dto.setFraudRate(labeled > 0 ? (double) fraud / labeled * 100.0 : 0.0);
                dto.setRecentCount(total / 30); // estimate
            }
            dto.setDemoMode(false);
            return dto;
        } catch (Exception e) {
            log.error("Error computing dashboard summary: {}", e.getMessage());
            return buildEmptySummary();
        }
    }

    public List<TrendDataDto> getTrends(String period) {
        if (transactionService.isDemoMode()) {
            return demoDataGenerator.generateTrends(period);
        }

        int buckets = "hourly".equalsIgnoreCase(period) ? 24 : 30;
        String labelPrefix = "hourly".equalsIgnoreCase(period) ? "H" : "D";

        try {
            AggregationOperation bucketAuto = context -> new Document("$bucketAuto", new Document()
                .append("groupBy", "$transactionDT")
                .append("buckets", buckets)
                .append("output", new Document()
                    .append("count", new Document("$sum", 1))
                    .append("fraudCount", new Document("$sum", "$isFraud"))));

            Aggregation agg = Aggregation.newAggregation(bucketAuto);
            AggregationResults<Document> results =
                    mongoTemplate.aggregate(agg, Transaction.class, Document.class);

            List<TrendDataDto> trends = new ArrayList<>();
            int idx = 1;
            for (Document doc : results.getMappedResults()) {
                long count = ((Number) doc.getOrDefault("count", 0)).longValue();
                long fraudCount = ((Number) doc.getOrDefault("fraudCount", 0)).longValue();
                trends.add(new TrendDataDto(labelPrefix + idx++, count, fraudCount));
            }
            return trends;
        } catch (Exception e) {
            log.error("Error computing trends: {}", e.getMessage());
            return List.of();
        }
    }

    public FraudDistributionDto getFraudDistribution() {
        if (transactionService.isDemoMode()) {
            return demoDataGenerator.generateFraudDistribution();
        }

        try {
            AggregationOperation group = context -> new Document("$group", new Document()
                .append("_id", "$isFraud")
                .append("count", new Document("$sum", 1)));

            Aggregation agg = Aggregation.newAggregation(group);
            AggregationResults<Document> results =
                    mongoTemplate.aggregate(agg, Transaction.class, Document.class);

            long fraudCount = 0L;
            long legitCount = 0L;
            long unknownCount = 0L;

            for (Document doc : results.getMappedResults()) {
                Object idVal = doc.get("_id");
                long count = ((Number) doc.getOrDefault("count", 0)).longValue();
                if (idVal == null) {
                    unknownCount += count;
                } else if (((Number) idVal).intValue() == 1) {
                    fraudCount += count;
                } else {
                    legitCount += count;
                }
            }

            long labeled = fraudCount + legitCount;
            FraudDistributionDto dto = new FraudDistributionDto();
            dto.setFraudCount(fraudCount);
            dto.setLegitimateCount(legitCount);
            dto.setUnknownCount(unknownCount);
            dto.setFraudRate(labeled > 0 ? (double) fraudCount / labeled * 100.0 : 0.0);
            dto.setDemoMode(false);
            return dto;
        } catch (Exception e) {
            log.error("Error computing fraud distribution: {}", e.getMessage());
            FraudDistributionDto empty = new FraudDistributionDto();
            empty.setDemoMode(false);
            return empty;
        }
    }

    // ---- helpers ----

    private long extractCount(Document raw, String facetName) {
        List<?> list = (List<?>) raw.get(facetName);
        if (list == null || list.isEmpty()) return 0L;
        Document first = (Document) list.get(0);
        return ((Number) first.getOrDefault("n", 0)).longValue();
    }

    private double extractSum(Document raw, String facetName) {
        List<?> list = (List<?>) raw.get(facetName);
        if (list == null || list.isEmpty()) return 0.0;
        Document first = (Document) list.get(0);
        Object sum = first.get("sum");
        return sum instanceof Number ? ((Number) sum).doubleValue() : 0.0;
    }

    private DashboardSummaryDto buildEmptySummary() {
        DashboardSummaryDto dto = new DashboardSummaryDto();
        dto.setDemoMode(false);
        return dto;
    }
}
