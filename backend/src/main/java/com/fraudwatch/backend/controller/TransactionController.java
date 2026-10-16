package com.fraudwatch.backend.controller;

import com.fraudwatch.backend.document.Transaction;
import com.fraudwatch.backend.dto.PagedResponseDto;
import com.fraudwatch.backend.dto.TransactionDetailDto;
import com.fraudwatch.backend.dto.TransactionDto;
import com.fraudwatch.backend.dto.TransactionFilterDto;
import com.fraudwatch.backend.exception.InvalidFilterException;
import com.fraudwatch.backend.service.TransactionService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private static final Set<String> ALLOWED_SORT_FIELDS =
            Set.of("transactionDT", "transactionAmt", "transactionId", "isFraud");

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<PagedResponseDto<TransactionDto>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Double minAmt,
            @RequestParam(required = false) Double maxAmt,
            @RequestParam(required = false) Integer isFraud,
            @RequestParam(required = false) String transactionId,
            @RequestParam(defaultValue = "transactionDT") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        if (page < 0) throw new InvalidFilterException("Page index must be >= 0");
        if (size < 1 || size > 100) throw new InvalidFilterException("Page size must be between 1 and 100");
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new InvalidFilterException("Invalid sortBy: '" + sortBy + "'. Allowed: " + ALLOWED_SORT_FIELDS);
        }

        TransactionFilterDto filter = new TransactionFilterDto();
        filter.setPage(page);
        filter.setSize(size);
        filter.setMinAmt(minAmt);
        filter.setMaxAmt(maxAmt);
        filter.setIsFraud(isFraud);
        filter.setTransactionId(transactionId);
        filter.setSortBy(sortBy);
        filter.setSortDir(sortDir);

        return ResponseEntity.ok(transactionService.getTransactions(filter));
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<TransactionDetailDto> getById(@PathVariable Long transactionId) {
        return ResponseEntity.ok(transactionService.getById(transactionId));
    }

    @GetMapping("/export")
    public void exportCsv(
            @RequestParam(required = false) Double minAmt,
            @RequestParam(required = false) Double maxAmt,
            @RequestParam(required = false) Integer isFraud,
            @RequestParam(required = false) String transactionId,
            HttpServletResponse response) throws IOException {

        TransactionFilterDto filter = new TransactionFilterDto();
        filter.setMinAmt(minAmt);
        filter.setMaxAmt(maxAmt);
        filter.setIsFraud(isFraud);
        filter.setTransactionId(transactionId);
        filter.setSize(10000);

        List<Transaction> transactions = transactionService.getForExport(filter);

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"transactions.csv\"");

        PrintWriter writer = response.getWriter();
        writer.println("transactionId,transactionAmt,isFraud,transactionDT,productCD,card4");
        for (Transaction t : transactions) {
            writer.println(
                    csvVal(t.getTransactionId()) + "," +
                    csvVal(t.getTransactionAmt()) + "," +
                    csvVal(t.getIsFraud()) + "," +
                    csvVal(t.getTransactionDT()) + "," +
                    csvVal(t.getProductCD()) + "," +
                    csvVal(t.getCard4())
            );
        }
        writer.flush();
    }

    private String csvVal(Object val) {
        if (val == null) return "";
        String s = val.toString();
        if (s.contains(",") || s.contains("\"") || s.contains("\n")) {
            return "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }
}
