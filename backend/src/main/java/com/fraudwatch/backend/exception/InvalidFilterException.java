package com.fraudwatch.backend.exception;

public class InvalidFilterException extends RuntimeException {

    public InvalidFilterException(String message) {
        super(message);
    }
}
