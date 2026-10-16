package com.fraudwatch.backend.service;

import com.fraudwatch.backend.config.DemoDataGenerator;
import com.fraudwatch.backend.document.Transaction;
import com.fraudwatch.backend.dto.PagedResponseDto;
import com.fraudwatch.backend.dto.TransactionDetailDto;
import com.fraudwatch.backend.dto.TransactionDto;
import com.fraudwatch.backend.dto.TransactionFilterDto;
import com.fraudwatch.backend.exception.InvalidFilterException;
import com.fraudwatch.backend.exception.ResourceNotFoundException;
import com.fraudwatch.backend.mapper.TransactionMapper;
import com.fraudwatch.backend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final DemoDataGenerator demoDataGenerator;
    private final MongoTemplate mongoTemplate;

    @Value("${app.demo-mode.enabled:false}")
    private boolean demoModeEnabled;

    @Value("${app.pagination.max-size:100}")
    private int maxPageSize;

    // Cached demo-active flag: null = not yet checked
    private volatile Boolean isDemoActive = null;

    public TransactionService(TransactionRepository transactionRepository,
                               TransactionMapper transactionMapper,
                               DemoDataGenerator demoDataGenerator,
                               MongoTemplate mongoTemplate) {
        this.transactionRepository = transactionRepository;
        this.transactionMapper = transactionMapper;
        this.demoDataGenerator = demoDataGenerator;
        this.mongoTemplate = mongoTemplate;
    }

    public PagedResponseDto<TransactionDto> getTransactions(TransactionFilterDto filter) {
        validateFilter(filter);

        if (isDemoMode()) {
            PageRequest pageable = PageRequest.of(filter.getPage(), filter.getSize());
            Page<Transaction> demoPage = demoDataGenerator.pageTransactions(filter, pageable);
            List<TransactionDto> content = demoPage.getContent().stream()
                    .map(t -> {
                        TransactionDto dto = transactionMapper.toDto(t);
                        dto.setDemoMode(true);
                        return dto;
                    })
                    .collect(Collectors.toList());
            return new PagedResponseDto<>(content,
                    demoPage.getNumber(),
                    demoPage.getSize(),
                    demoPage.getTotalElements(),
                    demoPage.getTotalPages(),
                    true);
        }

        PageRequest pageable = PageRequest.of(filter.getPage(), filter.getSize());
        Page<Transaction> page = transactionRepository.findWithFilters(filter, pageable);
        List<TransactionDto> content = page.getContent().stream()
                .map(transactionMapper::toDto)
                .collect(Collectors.toList());
        return new PagedResponseDto<>(content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                false);
    }

    public TransactionDetailDto getById(Long transactionId) {
        if (isDemoMode()) {
            Optional<Transaction> found = demoDataGenerator.getDemoTransactions().stream()
                    .filter(t -> transactionId.equals(t.getTransactionId()))
                    .findFirst();
            Transaction t = found.orElseThrow(() ->
                    new ResourceNotFoundException("Transaction", transactionId));
            TransactionDetailDto dto = transactionMapper.toDetailDto(t);
            dto.setDemoMode(true);
            return dto;
        }

        Transaction t = transactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", transactionId));
        return transactionMapper.toDetailDto(t);
    }

    public List<Transaction> getForExport(TransactionFilterDto filter) {
        if (isDemoMode()) {
            // Apply basic filter to demo data, cap at 10,000
            return demoDataGenerator.getDemoTransactions().stream()
                    .filter(t -> {
                        if (filter.getMinAmt() != null && (t.getTransactionAmt() == null || t.getTransactionAmt() < filter.getMinAmt())) return false;
                        if (filter.getMaxAmt() != null && (t.getTransactionAmt() == null || t.getTransactionAmt() > filter.getMaxAmt())) return false;
                        if (filter.getIsFraud() != null && !filter.getIsFraud().equals(t.getIsFraud())) return false;
                        return true;
                    })
                    .limit(10000)
                    .collect(Collectors.toList());
        }
        return transactionRepository.findForExport(filter);
    }

    /**
     * Checks whether demo mode is active (collection empty + demo enabled).
     * Result is cached after the first call.
     */
    public boolean isDemoMode() {
        if (isDemoActive == null) {
            synchronized (this) {
                if (isDemoActive == null) {
                    if (!demoModeEnabled) {
                        isDemoActive = false;
                    } else {
                        try {
                            long count = mongoTemplate.estimatedCount(Transaction.class);
                            isDemoActive = (count == 0);
                        } catch (Exception e) {
                            isDemoActive = demoModeEnabled;
                        }
                    }
                }
            }
        }
        return isDemoActive;
    }

    /**
     * Resets the cached demo-active flag (useful when data is imported).
     */
    public void resetDemoCache() {
        isDemoActive = null;
    }

    private void validateFilter(TransactionFilterDto filter) {
        if (filter.getPage() < 0) {
            throw new InvalidFilterException("Page index must be >= 0");
        }
        if (filter.getSize() < 1 || filter.getSize() > maxPageSize) {
            throw new InvalidFilterException("Page size must be between 1 and " + maxPageSize);
        }
        if (filter.getMinAmt() != null && filter.getMinAmt() < 0) {
            throw new InvalidFilterException("minAmt must be >= 0");
        }
        if (filter.getMaxAmt() != null && filter.getMinAmt() != null
                && filter.getMaxAmt() < filter.getMinAmt()) {
            throw new InvalidFilterException("maxAmt must be >= minAmt");
        }
    }
}
