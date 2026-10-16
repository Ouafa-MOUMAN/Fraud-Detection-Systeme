package com.fraudwatch.backend.dto;

public class TransactionDto {

    private String id;
    private Long transactionId;
    private Long transactionDT;
    private Double transactionAmt;
    private String productCD;
    private String card4;
    private Integer isFraud;
    private boolean demoMode;

    public TransactionDto() {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getTransactionId() { return transactionId; }
    public void setTransactionId(Long transactionId) { this.transactionId = transactionId; }

    public Long getTransactionDT() { return transactionDT; }
    public void setTransactionDT(Long transactionDT) { this.transactionDT = transactionDT; }

    public Double getTransactionAmt() { return transactionAmt; }
    public void setTransactionAmt(Double transactionAmt) { this.transactionAmt = transactionAmt; }

    public String getProductCD() { return productCD; }
    public void setProductCD(String productCD) { this.productCD = productCD; }

    public String getCard4() { return card4; }
    public void setCard4(String card4) { this.card4 = card4; }

    public Integer getIsFraud() { return isFraud; }
    public void setIsFraud(Integer isFraud) { this.isFraud = isFraud; }

    public boolean isDemoMode() { return demoMode; }
    public void setDemoMode(boolean demoMode) { this.demoMode = demoMode; }
}
