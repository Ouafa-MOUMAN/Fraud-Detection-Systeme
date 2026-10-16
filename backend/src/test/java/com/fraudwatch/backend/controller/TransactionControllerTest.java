package com.fraudwatch.backend.controller;

import com.fraudwatch.backend.config.SecurityConfig;
import com.fraudwatch.backend.config.CorsConfig;
import com.fraudwatch.backend.dto.PagedResponseDto;
import com.fraudwatch.backend.controller.HealthController;
import com.fraudwatch.backend.dto.TransactionDetailDto;
import com.fraudwatch.backend.dto.TransactionDto;
import com.fraudwatch.backend.exception.GlobalExceptionHandler;
import com.fraudwatch.backend.exception.ResourceNotFoundException;
import com.fraudwatch.backend.service.TransactionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({TransactionController.class, HealthController.class})
@Import({GlobalExceptionHandler.class, SecurityConfig.class, CorsConfig.class})
@WithMockUser
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TransactionService transactionService;

    @Test
    void getTransactions_returns200_withValidParams() throws Exception {
        TransactionDto dto = new TransactionDto();
        dto.setTransactionId(3000000L);
        dto.setTransactionAmt(100.0);

        PagedResponseDto<TransactionDto> paged = new PagedResponseDto<>(
                List.of(dto), 0, 20, 1L, 1, false);

        when(transactionService.getTransactions(any())).thenReturn(paged);

        mockMvc.perform(get("/api/transactions")
                        .param("page", "0")
                        .param("size", "20")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.page").value(0));
    }

    @Test
    void getTransactions_returns400_whenSizeExceedsMax() throws Exception {
        mockMvc.perform(get("/api/transactions")
                        .param("page", "0")
                        .param("size", "200") // exceeds limit of 100
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void getTransactions_returns400_whenInvalidSortBy() throws Exception {
        mockMvc.perform(get("/api/transactions")
                        .param("sortBy", "invalidField")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getById_returns200_whenTransactionExists() throws Exception {
        TransactionDetailDto detail = new TransactionDetailDto();
        detail.setTransactionId(3000000L);
        detail.setTransactionAmt(150.0);

        when(transactionService.getById(3000000L)).thenReturn(detail);

        mockMvc.perform(get("/api/transactions/3000000")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionId").value(3000000));
    }

    @Test
    void getById_returns404_whenTransactionNotFound() throws Exception {
        when(transactionService.getById(99999L))
                .thenThrow(new ResourceNotFoundException("Transaction", 99999L));

        mockMvc.perform(get("/api/transactions/99999")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void health_returns200() throws Exception {
        mockMvc.perform(get("/api/health")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }
}
