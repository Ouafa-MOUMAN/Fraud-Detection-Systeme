package com.fraudwatch.backend.repository;

import com.fraudwatch.backend.document.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface TransactionRepository extends MongoRepository<Transaction, String>, TransactionRepositoryCustom {

    Optional<Transaction> findByTransactionId(Long transactionId);
}
