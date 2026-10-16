package com.fraudwatch.backend.repository;

import com.fraudwatch.backend.document.Transaction;
import com.fraudwatch.backend.dto.TransactionFilterDto;
import com.fraudwatch.backend.exception.InvalidFilterException;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class TransactionRepositoryImpl implements TransactionRepositoryCustom {

    private static final Set<String> ALLOWED_SORT_FIELDS =
            Set.of("transactionDT", "transactionAmt", "transactionId", "isFraud");

    private final MongoTemplate mongoTemplate;

    public TransactionRepositoryImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public Page<Transaction> findWithFilters(TransactionFilterDto filter, Pageable pageable) {
        Query query = buildQuery(filter);
        Query countQuery = buildQuery(filter);

        long total = mongoTemplate.count(countQuery, Transaction.class);

        Sort sort = buildSort(filter);
        query.with(PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort));

        List<Transaction> results = mongoTemplate.find(query, Transaction.class);
        return new PageImpl<>(results, pageable, total);
    }

    @Override
    public List<Transaction> findForExport(TransactionFilterDto filter) {
        Query query = buildQuery(filter);
        // Cap export at 10,000 rows
        query.limit(10000);
        Sort sort = buildSort(filter);
        query.with(sort);
        return mongoTemplate.find(query, Transaction.class);
    }

    private Query buildQuery(TransactionFilterDto filter) {
        List<Criteria> criteriaList = new ArrayList<>();

        if (filter.getMinAmt() != null) {
            criteriaList.add(Criteria.where("transactionAmt").gte(filter.getMinAmt()));
        }
        if (filter.getMaxAmt() != null) {
            criteriaList.add(Criteria.where("transactionAmt").lte(filter.getMaxAmt()));
        }
        if (filter.getIsFraud() != null) {
            criteriaList.add(Criteria.where("isFraud").is(filter.getIsFraud()));
        }
        if (filter.getTransactionId() != null && !filter.getTransactionId().isBlank()) {
            try {
                long txId = Long.parseLong(filter.getTransactionId().trim());
                criteriaList.add(Criteria.where("transactionId").is(txId));
            } catch (NumberFormatException e) {
                // Invalid transactionId format — return no results
                criteriaList.add(Criteria.where("transactionId").is(-1L));
            }
        }

        Query query = new Query();
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }
        return query;
    }

    private Sort buildSort(TransactionFilterDto filter) {
        String sortBy = filter.getSortBy() != null ? filter.getSortBy() : "transactionDT";
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new InvalidFilterException(
                "Invalid sortBy field: '" + sortBy + "'. Allowed: " + ALLOWED_SORT_FIELDS);
        }
        Sort.Direction direction = "ASC".equalsIgnoreCase(filter.getSortDir())
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return Sort.by(direction, sortBy);
    }
}
