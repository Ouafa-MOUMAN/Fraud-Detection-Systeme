package com.fraudwatch.backend.dto;

public class FraudDistributionDto {

    private long fraudCount;
    private long legitimateCount;
    private long unknownCount;
    private double fraudRate;
    private boolean demoMode;

    public FraudDistributionDto() {
    }

    public long getFraudCount() { return fraudCount; }
    public void setFraudCount(long fraudCount) { this.fraudCount = fraudCount; }

    public long getLegitimateCount() { return legitimateCount; }
    public void setLegitimateCount(long legitimateCount) { this.legitimateCount = legitimateCount; }

    public long getUnknownCount() { return unknownCount; }
    public void setUnknownCount(long unknownCount) { this.unknownCount = unknownCount; }

    public double getFraudRate() { return fraudRate; }
    public void setFraudRate(double fraudRate) { this.fraudRate = fraudRate; }

    public boolean isDemoMode() { return demoMode; }
    public void setDemoMode(boolean demoMode) { this.demoMode = demoMode; }
}
