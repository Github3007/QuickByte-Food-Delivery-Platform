package com.shiva.quickbite.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RestaurantResponse {

    private Long id;

    private String name;

    private String address;

    private Double rating;

    private String ownerName;
}