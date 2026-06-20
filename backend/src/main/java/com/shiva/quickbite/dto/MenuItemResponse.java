package com.shiva.quickbite.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MenuItemResponse {

    private Long id;

    private String name;

    private String description;

    private Double price;

    private Boolean available;

    private String category;

    private String restaurantName;
}