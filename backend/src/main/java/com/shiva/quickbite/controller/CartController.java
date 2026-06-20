package com.shiva.quickbite.controller;

import com.shiva.quickbite.dto.AddToCartRequest;
import com.shiva.quickbite.dto.CartResponse;
import com.shiva.quickbite.entity.CartItem;
import com.shiva.quickbite.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CartController {

    private final CartService cartService;

    @PostMapping("/add")
    public String addToCart(@Valid
            @RequestBody AddToCartRequest request,
            Authentication authentication
    ) {

        return cartService.addToCart(
                request,
                authentication
        );
    }

    @GetMapping
    public CartResponse getCart(
            Authentication authentication
    ) {

        return cartService.getCart(authentication);
    }

    @DeleteMapping("/items/{menuItemId}")
    public String removeFromCart(
            @PathVariable Long menuItemId,
            Authentication authentication
    ) {

        return cartService.removeFromCart(
                menuItemId,
                authentication
        );
    }
}