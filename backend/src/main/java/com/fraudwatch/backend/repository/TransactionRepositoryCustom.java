package com.fraudwatch.backend.repository;

import com.fraudwatch.backend.document.Transaction;
import com.fraudwatch.backend.dto.TransactionFilterDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TransactionRepositoryCustom {

    Page<Transaction> findWithFilters(TransactionFilterDto filter, Pageable pageable);

    List<Transaction> findForExport(TransactionFilterDto filter);
}
