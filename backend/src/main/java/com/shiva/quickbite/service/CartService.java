package com.shiva.quickbite.service;

import com.shiva.quickbite.dto.AddToCartRequest;
import com.shiva.quickbite.dto.CartItemResponse;
import com.shiva.quickbite.dto.CartResponse;
import com.shiva.quickbite.entity.*;
import com.shiva.quickbite.exception.CartItemNotFoundException;
import com.shiva.quickbite.exception.CartNotFoundException;
import com.shiva.quickbite.exception.UserNotFoundException;
import com.shiva.quickbite.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final MenuItemRepository menuItemRepository;

    public String addToCart(
            AddToCartRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found"
                        ));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {

                    Cart newCart = Cart.builder()
                            .user(user)
                            .build();

                    return cartRepository.save(newCart);
                });

        MenuItem menuItem = menuItemRepository
                .findById(request.getMenuItemId())
                .orElseThrow(() ->
                        new RuntimeException("Menu item not found"));

        CartItem cartItem = cartItemRepository
                .findByCartIdAndMenuItemId(
                        cart.getId(),
                        menuItem.getId()
                )
                .orElse(null);

        if (cartItem != null) {

            cartItem.setQuantity(
                    cartItem.getQuantity() + request.getQuantity()
            );

        } else {

            cartItem = CartItem.builder()
                    .cart(cart)
                    .menuItem(menuItem)
                    .quantity(request.getQuantity())
                    .build();
        }

        cartItemRepository.save(cartItem);

        return "Item added to cart";
    }

    public CartResponse getCart(
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found"
                        ));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {

                    Cart newCart = Cart.builder()
                            .user(user)
                            .build();

                    return cartRepository.save(newCart);
                });

        List<CartItem> cartItems =
                cartItemRepository.findByCartId(
                        cart.getId()
                );

        List<CartItemResponse> items =
                cartItems.stream()
                        .map(this::mapToCartItemResponse)
                        .toList();

        double grandTotal =
                items.stream()
                        .mapToDouble(
                                CartItemResponse::getTotalPrice
                        )
                        .sum();

        return CartResponse.builder()
                .items(items)
                .grandTotal(grandTotal)
                .build();
    }

    @Transactional
    public String removeFromCart(
            Long menuItemId,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found"
                        ));

        Cart cart = cartRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new CartNotFoundException(
                                "Cart not found"
                        ));

        CartItem cartItem = cartItemRepository
                .findByCartIdAndMenuItemId(
                        cart.getId(),
                        menuItemId
                )
                .orElseThrow(() ->
                        new CartItemNotFoundException(
                                "Item not found in cart"
                        ));

        cartItemRepository.delete(cartItem);

        return "Item removed from cart";
    }

    private CartItemResponse mapToCartItemResponse(
            CartItem cartItem
    ) {

        return CartItemResponse.builder()
                .menuItemId(
                        cartItem.getMenuItem().getId()
                )
                .itemName(
                        cartItem.getMenuItem().getName()
                )
                .quantity(
                        cartItem.getQuantity()
                )
                .price(
                        cartItem.getMenuItem().getPrice()
                )
                .totalPrice(
                        cartItem.getQuantity()
                                * cartItem.getMenuItem().getPrice()
                )
                .build();
    }
}