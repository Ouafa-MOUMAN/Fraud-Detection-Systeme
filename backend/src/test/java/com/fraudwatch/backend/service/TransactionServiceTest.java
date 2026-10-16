package com.fraudwatch.backend.service;

import com.fraudwatch.backend.config.DemoDataGenerator;
import com.fraudwatch.backend.document.Transaction;
import com.fraudwatch.backend.dto.PagedResponseDto;
import com.fraudwatch.backend.dto.TransactionDetailDto;
import com.fraudwatch.backend.dto.TransactionDto;
import com.fraudwatch.backend.dto.TransactionFilterDto;
import com.fraudwatch.backend.exception.ResourceNotFoundException;
import com.fraudwatch.backend.mapper.TransactionMapper;
import com.fraudwatch.backend.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private TransactionMapper transactionMapper;

    @Mock
    private DemoDataGenerator demoDataGenerator;

    @Mock
    private MongoTemplate mongoTemplate;

    private TransactionService service;

    @BeforeEach
    void setUp() {
        service = new TransactionService(transactionRepository, transactionMapper, demoDataGenerator, mongoTemplate);
        ReflectionTestUtils.setField(service, "demoModeEnabled", true);
        ReflectionTestUtils.setField(service, "maxPageSize", 100);
    }

    @Test
    void getTransactions_returnsDemoData_whenDemoModeActive() {
        // Arrange: collection is empty → demo mode
        when(mongoTemplate.estimatedCount(Transaction.class)).thenReturn(0L);

        Transaction t = new Transaction();
        t.setTransactionId(3000000L);
        t.setTransactionAmt(150.0);
        t.setIsFraud(0);

        var demoPage = new PageImpl<>(List.of(t), PageRequest.of(0, 20), 1);
        when(demoDataGenerator.pageTransactions(any(), any())).thenReturn(demoPage);

        TransactionDto dto = new TransactionDto();
        dto.setTransactionId(3000000L);
        when(transactionMapper.toDto(t)).thenReturn(dto);

        TransactionFilterDto filter = new TransactionFilterDto();

        // Act
        PagedResponseDto<TransactionDto> result = service.getTransactions(filter);

        // Assert
        assertTrue(result.isDemoMode(), "Response should be marked as demo mode");
        assertEquals(1, result.getContent().size());
        verify(transactionRepository, never()).findWithFilters(any(), any());
    }

    @Test
    void getTransactions_returnsRepoData_whenDemoModeInactive() {
        // Arrange: collection has data
        when(mongoTemplate.estimatedCount(Transaction.class)).thenReturn(100L);

        Transaction t = new Transaction();
        t.setTransactionId(1L);
        var repoPage = new PageImpl<>(List.of(t), PageRequest.of(0, 20), 1);
        when(transactionRepository.findWithFilters(any(), any())).thenReturn(repoPage);

        TransactionDto dto = new TransactionDto();
        dto.setTransactionId(1L);
        when(transactionMapper.toDto(t)).thenReturn(dto);

        TransactionFilterDto filter = new TransactionFilterDto();

        // Act
        PagedResponseDto<TransactionDto> result = service.getTransactions(filter);

        // Assert
        assertFalse(result.isDemoMode(), "Response should NOT be marked as demo mode");
        assertEquals(1, result.getContent().size());
        verify(demoDataGenerator, never()).pageTransactions(any(), any());
    }

    @Test
    void getById_throwsResourceNotFoundException_whenTransactionNotFound() {
        // Arrange: collection has data so real repo is used
        when(mongoTemplate.estimatedCount(Transaction.class)).thenReturn(100L);
        when(transactionRepository.findByTransactionId(99999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> service.getById(99999L));
    }

    @Test
    void getById_returnsDemoTransaction_whenDemoModeActive() {
        // Arrange
        when(mongoTemplate.estimatedCount(Transaction.class)).thenReturn(0L);

        Transaction t = new Transaction();
        t.setId("demo-1");
        t.setTransactionId(3000000L);
        when(demoDataGenerator.getDemoTransactions()).thenReturn(List.of(t));

        TransactionDetailDto detailDto = new TransactionDetailDto();
        detailDto.setTransactionId(3000000L);
        when(transactionMapper.toDetailDto(t)).thenReturn(detailDto);

        // Act
        TransactionDetailDto result = service.getById(3000000L);

        // Assert
        assertNotNull(result);
        assertTrue(result.isDemoMode());
        assertEquals(3000000L, result.getTransactionId());
    }

    @Test
    void getTransactions_throwsInvalidFilterException_whenSizeExceedsMax() {
        TransactionFilterDto filter = new TransactionFilterDto();
        filter.setSize(200); // exceeds max of 100

        // Pre-set isDemoActive to false to bypass DB check
        ReflectionTestUtils.setField(service, "isDemoActive", false);

        assertThrows(com.fraudwatch.backend.exception.InvalidFilterException.class,
                () -> service.getTransactions(filter));
    }

    @Test
    void getTransactions_filterByIsFraud_passesThroughToRepository() {
        // Arrange: real DB mode
        ReflectionTestUtils.setField(service, "isDemoActive", false);

        Transaction fraudTx = new Transaction();
        fraudTx.setTransactionId(100L);
        fraudTx.setIsFraud(1);
        var repoPage = new PageImpl<>(List.of(fraudTx), PageRequest.of(0, 20), 1);

        // Capture the filter passed to the repository
        when(transactionRepository.findWithFilters(
                argThat(f -> f != null && Integer.valueOf(1).equals(f.getIsFraud())),
                any()))
                .thenReturn(repoPage);

        TransactionDto dto = new TransactionDto();
        dto.setTransactionId(100L);
        when(transactionMapper.toDto(fraudTx)).thenReturn(dto);

        TransactionFilterDto filter = new TransactionFilterDto();
        filter.setIsFraud(1);

        // Act
        PagedResponseDto<TransactionDto> result = service.getTransactions(filter);

        // Assert
        assertEquals(1, result.getContent().size());
        assertEquals(100L, result.getContent().get(0).getTransactionId());
        verify(transactionRepository).findWithFilters(
                argThat(f -> Integer.valueOf(1).equals(f.getIsFraud())), any());
    }
}
