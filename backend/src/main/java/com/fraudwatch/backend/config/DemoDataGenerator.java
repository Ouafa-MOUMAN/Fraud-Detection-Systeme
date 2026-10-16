package com.fraudwatch.backend.config;

import com.fraudwatch.backend.document.Transaction;
import com.fraudwatch.backend.dto.DashboardSummaryDto;
import com.fraudwatch.backend.dto.FraudDistributionDto;
import com.fraudwatch.backend.dto.TransactionFilterDto;
import com.fraudwatch.backend.dto.TrendDataDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Component
public class DemoDataGenerator {

    private static final int DEMO_COUNT = 500;
    private static final String[] PRODUCT_CODES = {"W", "H", "C", "S", "R"};
    private static final String[] CARD_TYPES = {"visa", "mastercard", "american express", "discover"};
    private static final String[] EMAIL_DOMAINS = {"gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "protonmail.com"};

    private final List<Transaction> demoTransactions;
    private final Instant bootTime;

    public DemoDataGenerator() {
        this.bootTime = Instant.now();
        this.demoTransactions = Collections.unmodifiableList(generateTransactions(DEMO_COUNT));
    }

    /**
     * Returns the pre-generated list of demo transactions.
     */
    public List<Transaction> getDemoTransactions() {
        return demoTransactions;
    }

    /**
     * Generates a fixed set of demo transactions using a seeded Random for reproducibility.
     */
    public List<Transaction> generateTransactions(int count) {
        Random rng = new Random(42L);
        List<Transaction> transactions = new ArrayList<>(count);
        long nowSeconds = bootTime.getEpochSecond();
        long thirtyDaysSeconds = 30L * 24 * 3600;

        for (int i = 0; i < count; i++) {
            Transaction t = new Transaction();
            t.setId("demo-" + (i + 1));
            t.setTransactionId(3000000L + i);

            // TransactionDT: seconds offset spread over last 30 days
            long dtOffset = (long) (rng.nextDouble() * thirtyDaysSeconds);
            t.setTransactionDT(dtOffset);

            // Log-normal amount: realistic transaction distribution
            double logNormal = Math.exp(rng.nextGaussian() * 1.5 + 4.0);
            t.setTransactionAmt(Math.round(logNormal * 100.0) / 100.0);

            t.setProductCD(PRODUCT_CODES[rng.nextInt(PRODUCT_CODES.length)]);
            t.setCard4(CARD_TYPES[rng.nextInt(CARD_TYPES.length)]);
            t.setCard6(rng.nextBoolean() ? "credit" : "debit");
            t.setPEmaildomain(EMAIL_DOMAINS[rng.nextInt(EMAIL_DOMAINS.length)]);
            t.setREmaildomain(rng.nextDouble() < 0.7 ? EMAIL_DOMAINS[rng.nextInt(EMAIL_DOMAINS.length)] : null);

            // 10% fraud rate
            t.setIsFraud(rng.nextDouble() < 0.10 ? 1 : 0);
            t.setImportedAt(bootTime);

            transactions.add(t);
        }
        return transactions;
    }

    /**
     * Computes dashboard summary from demo data in-memory (acceptable: small fixed dataset).
     */
    public DashboardSummaryDto generateSummary() {
        long total = demoTransactions.size();
        long fraudCount = demoTransactions.stream().filter(t -> Integer.valueOf(1).equals(t.getIsFraud())).count();
        long legitCount = demoTransactions.stream().filter(t -> Integer.valueOf(0).equals(t.getIsFraud())).count();
        double totalAmt = demoTransactions.stream()
                .mapToDouble(t -> t.getTransactionAmt() != null ? t.getTransactionAmt() : 0.0)
                .sum();
        // "Recent" = last 24 h of the 30-day range (~1/30th of total)
        long recentCount = total / 30;

        DashboardSummaryDto dto = new DashboardSummaryDto();
        dto.setTotalTransactions(total);
        dto.setFraudCount(fraudCount);
        dto.setLegitimateCount(legitCount);
        dto.setFraudRate(total > 0 ? (double) fraudCount / total * 100.0 : 0.0);
        dto.setTotalAmount(Math.round(totalAmt * 100.0) / 100.0);
        dto.setRecentCount(recentCount);
        dto.setDemoMode(true);
        return dto;
    }

    /**
     * Computes fraud distribution from demo data.
     */
    public FraudDistributionDto generateFraudDistribution() {
        long fraudCount = demoTransactions.stream().filter(t -> Integer.valueOf(1).equals(t.getIsFraud())).count();
        long legitCount = demoTransactions.stream().filter(t -> Integer.valueOf(0).equals(t.getIsFraud())).count();
        long unknownCount = demoTransactions.stream().filter(t -> t.getIsFraud() == null).count();
        long labeled = fraudCount + legitCount;

        FraudDistributionDto dto = new FraudDistributionDto();
        dto.setFraudCount(fraudCount);
        dto.setLegitimateCount(legitCount);
        dto.setUnknownCount(unknownCount);
        dto.setFraudRate(labeled > 0 ? (double) fraudCount / labeled * 100.0 : 0.0);
        dto.setDemoMode(true);
        return dto;
    }

    /**
     * Generates trend data split across buckets (24 for hourly, 30 for daily).
     */
    public List<TrendDataDto> generateTrends(String period) {
        int buckets = "hourly".equalsIgnoreCase(period) ? 24 : 30;
        String labelPrefix = "hourly".equalsIgnoreCase(period) ? "H" : "D";
        int total = demoTransactions.size();
        Random rng = new Random(42L);

        List<TrendDataDto> trends = new ArrayList<>(buckets);
        int remaining = total;
        for (int i = 0; i < buckets; i++) {
            int baseCount = remaining / (buckets - i);
            int count = baseCount + rng.nextInt(Math.max(1, baseCount / 2)) - baseCount / 4;
            count = Math.max(0, Math.min(count, remaining));
            remaining -= count;
            int fraudInBucket = (int) Math.round(count * 0.10);
            trends.add(new TrendDataDto(labelPrefix + (i + 1), count, fraudInBucket));
        }
        return trends;
    }

    /**
     * Applies filter and pagination to demo transactions in-memory.
     */
    public Page<Transaction> pageTransactions(TransactionFilterDto filter, Pageable pageable) {
        List<Transaction> filtered = demoTransactions.stream()
                .filter(t -> {
                    if (filter.getMinAmt() != null && (t.getTransactionAmt() == null || t.getTransactionAmt() < filter.getMinAmt())) return false;
                    if (filter.getMaxAmt() != null && (t.getTransactionAmt() == null || t.getTransactionAmt() > filter.getMaxAmt())) return false;
                    if (filter.getIsFraud() != null && !filter.getIsFraud().equals(t.getIsFraud())) return false;
                    if (filter.getTransactionId() != null && !filter.getTransactionId().isBlank()) {
                        try {
                            long searchId = Long.parseLong(filter.getTransactionId().trim());
                            if (t.getTransactionId() == null || searchId != t.getTransactionId()) return false;
                        } catch (NumberFormatException e) {
                            return false;
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());

        long total = filtered.size();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        List<Transaction> page = start >= filtered.size() ? List.of() : filtered.subList(start, end);
        return new PageImpl<>(page, pageable, total);
    }
}
