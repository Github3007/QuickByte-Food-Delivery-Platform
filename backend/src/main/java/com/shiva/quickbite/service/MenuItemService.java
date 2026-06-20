package com.shiva.quickbite.service;

import com.shiva.quickbite.dto.MenuItemRequest;
import com.shiva.quickbite.dto.MenuItemResponse;
import com.shiva.quickbite.dto.PagedResponse;
import com.shiva.quickbite.entity.MenuItem;
import com.shiva.quickbite.entity.Restaurant;
import com.shiva.quickbite.entity.User;
import com.shiva.quickbite.exception.RestaurantNotFoundException;
import com.shiva.quickbite.exception.UnauthorizedException;
import com.shiva.quickbite.exception.UserNotFoundException;
import com.shiva.quickbite.repository.MenuItemRepository;
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
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    public String createMenuItem(
            MenuItemRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        Restaurant restaurant = restaurantRepository
                .findById(request.getRestaurantId())
                .orElseThrow(() ->
                        new RestaurantNotFoundException("Restaurant not found"));

        // OWNERSHIP VALIDATION
        if (!restaurant.getOwner().getId().equals(owner.getId())) {

            throw new UnauthorizedException(
                    "You can only manage your own restaurant"
            );
        }

        MenuItem menuItem = MenuItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(request.getCategory())
                .available(true)
                .restaurant(restaurant)
                .build();

        menuItemRepository.save(menuItem);

        return "Menu item created successfully";
    }

    public PagedResponse<MenuItemResponse> getRestaurantMenu(Long restaurantId, Pageable pageable) {

        Page<MenuItemResponse> page = menuItemRepository
                .findByRestaurantId(restaurantId, pageable)
                .map(this::mapToMenuItemResponse);

        return PagedResponse.<MenuItemResponse>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    private MenuItemResponse mapToMenuItemResponse(
            MenuItem menuItem
    ) {

        return MenuItemResponse.builder()
                .id(menuItem.getId())
                .name(menuItem.getName())
                .description(menuItem.getDescription())
                .price(menuItem.getPrice())
                .available(menuItem.getAvailable())
                .category(menuItem.getCategory())
                .restaurantName(
                        menuItem.getRestaurant().getName()
                )
                .build();
    }
}