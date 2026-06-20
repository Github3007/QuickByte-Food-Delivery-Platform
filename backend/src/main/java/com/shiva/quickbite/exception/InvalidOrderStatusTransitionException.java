package com.shiva.quickbite.exception;

public class InvalidOrderStatusTransitionException
        extends RuntimeException {

    public InvalidOrderStatusTransitionException(
            String message
    ) {
        super(message);
    }
}