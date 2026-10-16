package com.fraudwatch.backend.dto;

import java.time.Instant;

public class MonitoringStatusDto {

    private long documentCount;
    private Instant lastImportDate;
    private boolean dbConnected;
    private Instant lastRefresh;
    private boolean demoMode;
    private long responseTimeMs;

    public MonitoringStatusDto() {
    }

    public long getDocumentCount() { return documentCount; }
    public void setDocumentCount(long documentCount) { this.documentCount = documentCount; }

    public Instant getLastImportDate() { return lastImportDate; }
    public void setLastImportDate(Instant lastImportDate) { this.lastImportDate = lastImportDate; }

    public boolean isDbConnected() { return dbConnected; }
    public void setDbConnected(boolean dbConnected) { this.dbConnected = dbConnected; }

    public Instant getLastRefresh() { return lastRefresh; }
    public void setLastRefresh(Instant lastRefresh) { this.lastRefresh = lastRefresh; }

    public boolean isDemoMode() { return demoMode; }
    public void setDemoMode(boolean demoMode) { this.demoMode = demoMode; }

    public long getResponseTimeMs() { return responseTimeMs; }
    public void setResponseTimeMs(long responseTimeMs) { this.responseTimeMs = responseTimeMs; }
}
