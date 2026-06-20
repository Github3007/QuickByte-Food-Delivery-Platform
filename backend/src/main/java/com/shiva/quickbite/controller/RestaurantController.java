package com.shiva.quickbite.controller;

import com.shiva.quickbite.dto.PagedResponse;
import com.shiva.quickbite.dto.RestaurantRequest;
import com.shiva.quickbite.dto.RestaurantResponse;
import com.shiva.quickbite.entity.Restaurant;
import com.shiva.quickbite.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @PostMapping
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public String createRestaurant(@Valid
            @RequestBody RestaurantRequest request,
            Authentication authentication
    ) {

        return restaurantService.createRestaurant(
                request,
                authentication
        );
    }

    @GetMapping
    public PagedResponse<RestaurantResponse> getAllRestaurants(Pageable pageable) {

        return restaurantService.getAllRestaurants(pageable);
    }

}