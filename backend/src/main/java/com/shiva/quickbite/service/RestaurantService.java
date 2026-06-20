package com.shiva.quickbite.service;

import com.shiva.quickbite.dto.PagedResponse;
import com.shiva.quickbite.dto.RestaurantRequest;
import com.shiva.quickbite.dto.RestaurantResponse;
import com.shiva.quickbite.entity.Restaurant;
import com.shiva.quickbite.entity.User;
import com.shiva.quickbite.exception.UserNotFoundException;
import com.shiva.quickbite.repository.RestaurantRepository;
import com.shiva.quickbite.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    public String createRestaurant(
            RestaurantRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        Restaurant restaurant = Restaurant.builder()
                .name(request.getName())
                .address(request.getAddress())
                .rating(0.0)
                .owner(owner)
                .build();

        restaurantRepository.save(restaurant);

        return "Restaurant created successfully";
    }

    public PagedResponse<RestaurantResponse> getAllRestaurants(Pageable pageable) {

        Page<RestaurantResponse> page =
                restaurantRepository
                        .findAll(pageable)
                        .map(this::mapToRestaurantResponse);

        return PagedResponse.<RestaurantResponse>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    private RestaurantResponse mapToRestaurantResponse(
            Restaurant restaurant
    ) {

        return RestaurantResponse.builder()
                .id(restaurant.getId())
                .name(restaurant.getName())
                .address(restaurant.getAddress())
                .rating(restaurant.getRating())
                .ownerName(
                        restaurant.getOwner().getName()
                )
                .build();
    }
}