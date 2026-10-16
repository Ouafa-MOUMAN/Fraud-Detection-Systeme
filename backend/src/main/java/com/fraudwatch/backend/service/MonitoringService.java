package com.fraudwatch.backend.service;

import com.fraudwatch.backend.document.Transaction;
import com.fraudwatch.backend.dto.MonitoringStatusDto;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class MonitoringService {

    private static final Logger log = LoggerFactory.getLogger(MonitoringService.class);

    private final MongoTemplate mongoTemplate;
    private final TransactionService transactionService;
    private final Instant startTime;

    public MonitoringService(MongoTemplate mongoTemplate, TransactionService transactionService) {
        this.mongoTemplate = mongoTemplate;
        this.transactionService = transactionService;
        this.startTime = Instant.now();
    }

    public MonitoringStatusDto getStatus() {
        long start = System.currentTimeMillis();
        MonitoringStatusDto dto = new MonitoringStatusDto();

        // Check DB connectivity
        boolean connected = false;
        long documentCount = 0L;
        Instant lastImportDate = null;

        try {
            mongoTemplate.executeCommand(new Document("ping", 1));
            connected = true;

            // Count documents
            documentCount = mongoTemplate.estimatedCount(Transaction.class);

            // Try to find the most recent importedAt
            Document pipeline = new Document("$group", new Document()
                    .append("_id", (Object) null)
                    .append("maxImport", new Document("$max", "$importedAt")));
            var results = mongoTemplate.getDb()
                    .getCollection("transactions")
                    .aggregate(java.util.List.of(pipeline));
            for (Document doc : results) {
                Object maxImport = doc.get("maxImport");
                if (maxImport instanceof java.util.Date date) {
                    lastImportDate = date.toInstant();
                }
            }
        } catch (Exception e) {
            log.warn("MongoDB status check failed: {}", e.getMessage());
        }

        long responseTimeMs = System.currentTimeMillis() - start;

        dto.setDbConnected(connected);
        dto.setDocumentCount(documentCount);
        dto.setLastImportDate(lastImportDate);
        dto.setLastRefresh(Instant.now());
        dto.setResponseTimeMs(responseTimeMs);
        dto.setDemoMode(transactionService.isDemoMode());

        return dto;
    }
}
