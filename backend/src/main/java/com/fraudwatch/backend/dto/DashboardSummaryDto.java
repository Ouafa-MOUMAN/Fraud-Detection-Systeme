package com.fraudwatch.backend.dto;

public class DashboardSummaryDto {

    private long totalTransactions;
    private long fraudCount;
    private long legitimateCount;
    private double fraudRate;
    private double totalAmount;
    private long recentCount;
    private boolean demoMode;

    public DashboardSummaryDto() {
    }

    public long getTotalTransactions() { return totalTransactions; }
    public void setTotalTransactions(long totalTransactions) { this.totalTransactions = totalTransactions; }

    public long getFraudCount() { return fraudCount; }
    public void setFraudCount(long fraudCount) { this.fraudCount = fraudCount; }

    public long getLegitimateCount() { return legitimateCount; }
    public void setLegitimateCount(long legitimateCount) { this.legitimateCount = legitimateCount; }

    public double getFraudRate() { return fraudRate; }
    public void setFraudRate(double fraudRate) { this.fraudRate = fraudRate; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public long getRecentCount() { return recentCount; }
    public void setRecentCount(long recentCount) { this.recentCount = recentCount; }

    public boolean isDemoMode() { return demoMode; }
    public void setDemoMode(boolean demoMode) { this.demoMode = demoMode; }
}
