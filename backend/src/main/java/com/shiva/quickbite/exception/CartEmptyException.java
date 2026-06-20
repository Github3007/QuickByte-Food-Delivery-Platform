package com.shiva.quickbite.exception;

public class CartEmptyException
        extends RuntimeException {

    public CartEmptyException(String message) {
        super(message);
    }
}