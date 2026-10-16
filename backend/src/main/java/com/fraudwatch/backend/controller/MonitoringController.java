package com.fraudwatch.backend.controller;

import com.fraudwatch.backend.dto.MonitoringStatusDto;
import com.fraudwatch.backend.service.MonitoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/monitoring")
public class MonitoringController {

    private final MonitoringService monitoringService;

    public MonitoringController(MonitoringService monitoringService) {
        this.monitoringService = monitoringService;
    }

    @GetMapping("/status")
    public ResponseEntity<MonitoringStatusDto> getStatus() {
        return ResponseEntity.ok(monitoringService.getStatus());
    }
}
