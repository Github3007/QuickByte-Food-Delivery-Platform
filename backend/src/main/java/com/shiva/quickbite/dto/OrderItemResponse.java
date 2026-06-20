package com.shiva.quickbite.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItemResponse {

    private String itemName;

    private Integer quantity;

    private Double price;
}