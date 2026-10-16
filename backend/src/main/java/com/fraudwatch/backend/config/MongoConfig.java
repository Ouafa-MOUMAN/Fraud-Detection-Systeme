package com.fraudwatch.backend.config;

import com.fraudwatch.backend.document.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;

@Configuration
public class MongoConfig {

    private static final Logger log = LoggerFactory.getLogger(MongoConfig.class);

    private final MongoTemplate mongoTemplate;

    public MongoConfig(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void ensureIndexes() {
        try {
            var indexOps = mongoTemplate.indexOps(Transaction.class);

            // Unique index on transactionId for fast lookups and upserts
            indexOps.ensureIndex(new Index()
                .on("transactionId", Sort.Direction.ASC)
                .unique()
                .named("idx_transactionId_unique"));

            // Index on isFraud for fraud filter queries
            indexOps.ensureIndex(new Index()
                .on("isFraud", Sort.Direction.ASC)
                .named("idx_isFraud"));

            // Index on transactionAmt for amount range queries
            indexOps.ensureIndex(new Index()
                .on("transactionAmt", Sort.Direction.ASC)
                .named("idx_transactionAmt"));

            // Index on transactionDT for time-based sorting and filtering
            indexOps.ensureIndex(new Index()
                .on("transactionDT", Sort.Direction.DESC)
                .named("idx_transactionDT"));

            log.info("MongoDB indexes ensured on transactions collection");
        } catch (Exception e) {
            log.warn("Could not ensure MongoDB indexes (DB may not be reachable): {}", e.getMessage());
        }
    }
}
