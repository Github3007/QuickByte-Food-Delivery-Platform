package com.shiva.quickbite.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CartItemResponse {

    private Long menuItemId;

    private String itemName;

    private Integer quantity;

    private Double price;

    private Double totalPrice;
}