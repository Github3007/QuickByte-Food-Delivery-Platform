package com.shiva.quickbite.dto;

import com.shiva.quickbite.dto.OrderItemResponse;
import com.shiva.quickbite.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {

    private Long orderId;

    private String customerName;

    private String restaurantName;

    private Double totalAmount;

    private OrderStatus status;

    private LocalDateTime createdAt;

    private List<OrderItemResponse> items;
}