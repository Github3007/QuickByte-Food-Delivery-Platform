package com.shiva.quickbite.exception;

public class OrderAlreadyAssignedException
        extends RuntimeException {

    public OrderAlreadyAssignedException(String message) {
        super(message);
    }
}