package com.fraudwatch.backend.mapper;

import com.fraudwatch.backend.document.Transaction;
import com.fraudwatch.backend.dto.TransactionDetailDto;
import com.fraudwatch.backend.dto.TransactionDto;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    public TransactionDto toDto(Transaction t) {
        if (t == null) return null;
        TransactionDto dto = new TransactionDto();
        dto.setId(t.getId());
        dto.setTransactionId(t.getTransactionId());
        dto.setTransactionDT(t.getTransactionDT());
        dto.setTransactionAmt(t.getTransactionAmt());
        dto.setProductCD(t.getProductCD());
        dto.setCard4(t.getCard4());
        dto.setIsFraud(t.getIsFraud());
        return dto;
    }

    public TransactionDetailDto toDetailDto(Transaction t) {
        if (t == null) return null;
        TransactionDetailDto dto = new TransactionDetailDto();
        dto.setId(t.getId());
        dto.setTransactionId(t.getTransactionId());
        dto.setTransactionDT(t.getTransactionDT());
        dto.setTransactionAmt(t.getTransactionAmt());
        dto.setProductCD(t.getProductCD());
        dto.setCard1(t.getCard1());
        dto.setCard2(t.getCard2());
        dto.setCard3(t.getCard3());
        dto.setCard4(t.getCard4());
        dto.setCard5(t.getCard5());
        dto.setCard6(t.getCard6());
        dto.setAddr1(t.getAddr1());
        dto.setAddr2(t.getAddr2());
        dto.setDist1(t.getDist1());
        dto.setDist2(t.getDist2());
        dto.setPEmaildomain(t.getPEmaildomain());
        dto.setREmaildomain(t.getREmaildomain());
        dto.setCFields(t.getCFields());
        dto.setDFields(t.getDFields());
        dto.setMFields(t.getMFields());
        dto.setIsFraud(t.getIsFraud());
        dto.setImportedAt(t.getImportedAt());
        return dto;
    }
}
