package com.shiva.quickbite.controller;

import com.shiva.quickbite.dto.DeliveryStatusUpdateRequest;
import com.shiva.quickbite.dto.OrderResponse;
import com.shiva.quickbite.dto.PagedResponse;
import com.shiva.quickbite.dto.UpdateOrderStatusRequest;
import com.shiva.quickbite.entity.Order;
import com.shiva.quickbite.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/place")
    public String placeOrder(
            Authentication authentication
    ) {

        return orderService.placeOrder(authentication);
    }

    @GetMapping("/my-orders")
    public PagedResponse<OrderResponse> getMyOrders(
            Authentication authentication, Pageable  pageable
    ) {

        return orderService.getMyOrders(authentication, pageable);
    }

    @GetMapping("/restaurant-orders")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public PagedResponse<Order> getRestaurantOrders(
            Authentication authentication, Pageable pageable
    ) {

        return orderService.getRestaurantOrders(
                authentication, pageable
        );
    }

    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public String updateOrderStatus(@Valid
            @PathVariable Long orderId,
            @RequestBody UpdateOrderStatusRequest request,
            Authentication authentication
    ) {

        return orderService.updateOrderStatus(
                orderId,
                request,
                authentication
        );
    }

    @GetMapping("/delivery/available")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public PagedResponse<Order> getAvailableOrders(Pageable pageable) {

        return orderService.getAvailableOrders(pageable);
    }

    @PatchMapping("/delivery/{orderId}/assign")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public String assignDelivery(
            @PathVariable Long orderId,
            Authentication authentication
    ) {

        return orderService.assignDelivery(
                orderId,
                authentication
        );
    }

    @PatchMapping("/delivery/{orderId}/status")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public String updateDeliveryStatus(@Valid
            @PathVariable Long orderId,
            @RequestBody DeliveryStatusUpdateRequest request,
            Authentication authentication
    ) {

        return orderService.updateDeliveryStatus(
                orderId,
                request,
                authentication
        );
    }

    @GetMapping("/delivery/my-orders")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public List<Order> getMyDeliveries(
            Authentication authentication
    ) {

        return orderService.getMyDeliveries(
                authentication
        );
    }
}