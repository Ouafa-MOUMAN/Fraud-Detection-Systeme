package com.fraudwatch.backend.dto;

public class TrendDataDto {

    private String label;
    private long count;
    private long fraudCount;

    public TrendDataDto() {
    }

    public TrendDataDto(String label, long count, long fraudCount) {
        this.label = label;
        this.count = count;
        this.fraudCount = fraudCount;
    }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }

    public long getFraudCount() { return fraudCount; }
    public void setFraudCount(long fraudCount) { this.fraudCount = fraudCount; }
}
