package com.fraudwatch.backend.controller;

import com.fraudwatch.backend.dto.DashboardSummaryDto;
import com.fraudwatch.backend.dto.FraudDistributionDto;
import com.fraudwatch.backend.dto.TrendDataDto;
import com.fraudwatch.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/transaction-trends")
    public ResponseEntity<List<TrendDataDto>> getTransactionTrends(
            @RequestParam(defaultValue = "daily") String period) {
        return ResponseEntity.ok(dashboardService.getTrends(period));
    }

    @GetMapping("/fraud-distribution")
    public ResponseEntity<FraudDistributionDto> getFraudDistribution() {
        return ResponseEntity.ok(dashboardService.getFraudDistribution());
    }
}
