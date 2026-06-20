package com.shiva.quickbite.dto;

import com.shiva.quickbite.dto.CartItemResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CartResponse {

    private List<CartItemResponse> items;

    private Double grandTotal;
}