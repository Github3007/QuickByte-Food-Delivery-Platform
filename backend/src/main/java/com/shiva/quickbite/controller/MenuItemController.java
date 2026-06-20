package com.shiva.quickbite.controller;

import com.shiva.quickbite.dto.MenuItemRequest;
import com.shiva.quickbite.dto.MenuItemResponse;
import com.shiva.quickbite.dto.PagedResponse;
import com.shiva.quickbite.entity.MenuItem;
import com.shiva.quickbite.service.MenuItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;

    @PostMapping("/menu-items")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public String createMenuItem(@Valid
            @RequestBody MenuItemRequest request,
            Authentication authentication
    ) {

        return menuItemService.createMenuItem(
                request,
                authentication
        );
    }

    @GetMapping("/restaurants/{restaurantId}/menu")
    public PagedResponse<MenuItemResponse> getRestaurantMenu(
            @PathVariable Long restaurantId, Pageable pageable
    ) {

        return menuItemService.getRestaurantMenu(restaurantId, pageable);
    }
}