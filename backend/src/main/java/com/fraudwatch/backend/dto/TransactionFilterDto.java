package com.fraudwatch.backend.dto;

public class TransactionFilterDto {

    private int page = 0;
    private int size = 20;
    private Double minAmt;
    private Double maxAmt;
    private Integer isFraud;
    private String transactionId;
    private String sortBy = "transactionDT";
    private String sortDir = "DESC";

    public TransactionFilterDto() {
    }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }

    public Double getMinAmt() { return minAmt; }
    public void setMinAmt(Double minAmt) { this.minAmt = minAmt; }

    public Double getMaxAmt() { return maxAmt; }
    public void setMaxAmt(Double maxAmt) { this.maxAmt = maxAmt; }

    public Integer getIsFraud() { return isFraud; }
    public void setIsFraud(Integer isFraud) { this.isFraud = isFraud; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }

    public String getSortDir() { return sortDir; }
    public void setSortDir(String sortDir) { this.sortDir = sortDir; }
}
