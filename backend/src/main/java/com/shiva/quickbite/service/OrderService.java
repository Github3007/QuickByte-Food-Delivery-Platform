package com.shiva.quickbite.service;

import com.shiva.quickbite.dto.*;
import com.shiva.quickbite.entity.*;
import com.shiva.quickbite.enums.OrderStatus;
import com.shiva.quickbite.exception.*;
import com.shiva.quickbite.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional
    public String placeOrder(
            Authentication authentication
    ) {

        String email = authentication.getName();

        User customer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found"
                        ));

        Cart cart = cartRepository.findByUserId(customer.getId())
                .orElseThrow(() ->
                        new CartNotFoundException("Cart not found"));

        List<CartItem> cartItems =
                cartItemRepository.findByCartId(cart.getId());

        if (cartItems.isEmpty()) {

            throw new CartEmptyException("Cart is empty");
        }
        Restaurant restaurant =
                cartItems.get(0)
                        .getMenuItem()
                        .getRestaurant();

        double totalAmount = cartItems.stream()
                .mapToDouble(item ->
                        item.getMenuItem().getPrice()
                                * item.getQuantity())
                .sum();

        Order order = Order.builder()
                .customer(customer)
                .restaurant(restaurant)
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .totalAmount(totalAmount)
                .build();

        orderRepository.save(order);

        for (CartItem cartItem : cartItems) {

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .menuItem(cartItem.getMenuItem())
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getMenuItem().getPrice())
                    .build();

            orderItemRepository.save(orderItem);
        }

        cartItemRepository.deleteAll(cartItems);

        return "Order placed successfully";
    }

    public PagedResponse<OrderResponse> getMyOrders(
            Authentication authentication, Pageable pageable
    ) {

        String email = authentication.getName();

        User customer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found"
                        ));

        Page<OrderResponse> page =
                orderRepository
                        .findByCustomerId(
                                customer.getId(),
                                pageable
                        )
                        .map(this::mapToOrderResponse);

        return PagedResponse.<OrderResponse>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    public PagedResponse<OrderResponse> getRestaurantOrders(
            Authentication authentication, Pageable pageable
    ) {

        String email = authentication.getName();

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found"
                        ));

        Page<OrderResponse> page = orderRepository.findByRestaurantOwnerId(
                owner.getId(), pageable)
                .map(this::mapToOrderResponse);

        return PagedResponse.<OrderResponse>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Transactional
    public String updateOrderStatus(
            Long orderId,
            UpdateOrderStatusRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found"
                        ));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new OrderNotFoundException("Order not found"));

        // OWNERSHIP VALIDATION
        if (!order.getRestaurant()
                .getOwner()
                .getId()
                .equals(owner.getId())) {

            throw new UnauthorizedException(
                    "You can only manage your own restaurant orders"
            );
        }
        if (!isRestaurantOwnerStatus(
                request.getStatus()
        )) {

            throw new UnauthorizedException(
                    "Restaurant owner cannot update order to "
                            + request.getStatus()
            );
        }

        if (!isValidTransition(order.getStatus(), request.getStatus())) {
            throw new InvalidOrderStatusTransitionException(
                    "Cannot move from "
                            + order.getStatus()
                            + " to "
                            + request.getStatus()
            );
        }
        order.setStatus(request.getStatus());

        orderRepository.save(order);

        return "Order status updated successfully";
    }

    public PagedResponse<OrderResponse> getAvailableOrders(Pageable pageable) {
        Page<OrderResponse> page = orderRepository.findByStatus(OrderStatus.READY_FOR_PICKUP, pageable)
                .map(this::mapToOrderResponse);

        return PagedResponse.<OrderResponse>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Transactional
    public String assignDelivery(
            Long orderId,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User partner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found"
                        ));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new OrderNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.READY_FOR_PICKUP) {

            throw new InvalidOrderStatusTransitionException(
                    "Only READY_FOR_PICKUP orders can be assigned"
            );
        }

        if (order.getDeliveryPartner() != null) {

            throw new OrderAlreadyAssignedException(
                    "Order already assigned"
            );
        }

        order.setDeliveryPartner(partner);
        order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        orderRepository.save(order);

        return "Delivery assigned successfully";
    }

    @Transactional
    public String updateDeliveryStatus(
            Long orderId,
            DeliveryStatusUpdateRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User partner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found"
                        ));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new OrderNotFoundException("Order not found"));

        // OWNERSHIP VALIDATION
        if (order.getDeliveryPartner() == null ||
                !order.getDeliveryPartner()
                        .getId()
                        .equals(partner.getId())) {

            throw new UnauthorizedException(
                    "You can only update your assigned deliveries"
            );
        }

        if (!isDeliveryPartnerStatus(
                request.getStatus()
        )) {

            throw new UnauthorizedException(
                    "Delivery partner cannot update order to "
                            + request.getStatus()
            );
        }

        if (!isValidTransition(
                order.getStatus(),
                request.getStatus()
        )) {

            throw new InvalidOrderStatusTransitionException(
                    "Cannot move from "
                            + order.getStatus()
                            + " to "
                            + request.getStatus()
            );
        }
        order.setStatus(request.getStatus());
        orderRepository.save(order);

        return "Delivery status updated successfully";
    }

    public List<OrderResponse> getMyDeliveries(
            Authentication authentication
    ) {

        String email = authentication.getName();

        User partner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found"
                        ));

        return orderRepository.findByDeliveryPartnerId(partner.getId())
                        .stream()
                        .map(this::mapToOrderResponse)
                        .toList();

    }

    private OrderResponse mapToOrderResponse(
            Order order
    ) {

        List<OrderItemResponse> items =
                order.getOrderItems()
                        .stream()
                        .map(item ->
                                OrderItemResponse.builder()
                                        .itemName(
                                                item.getMenuItem().getName()
                                        )
                                        .quantity(
                                                item.getQuantity()
                                        )
                                        .price(
                                                item.getPrice()
                                        )
                                        .build()
                        )
                        .toList();

        return OrderResponse.builder()
                .orderId(order.getId())
                .customerName(
                        order.getCustomer().getName()
                )
                .restaurantName(
                        order.getRestaurant().getName()
                )
                .totalAmount(
                        order.getTotalAmount()
                )
                .status(
                        order.getStatus()
                )
                .createdAt(
                        order.getCreatedAt()
                )
                .items(items)
                .build();
    }

    private boolean isValidTransition(
            OrderStatus currentStatus,
            OrderStatus newStatus
    ) {

        return switch (currentStatus) {

            case PENDING ->
                    newStatus == OrderStatus.ACCEPTED
                            || newStatus == OrderStatus.CANCELLED;

            case ACCEPTED ->
                    newStatus == OrderStatus.PREPARING
                            || newStatus == OrderStatus.CANCELLED;

            case PREPARING ->
                    newStatus == OrderStatus.READY_FOR_PICKUP;

            case READY_FOR_PICKUP ->
                    newStatus == OrderStatus.OUT_FOR_DELIVERY;

            case OUT_FOR_DELIVERY ->
                    newStatus == OrderStatus.DELIVERED;

            case DELIVERED, CANCELLED ->
                    false;
        };
    }

    private boolean isRestaurantOwnerStatus(
            OrderStatus status
    ) {

        return status == OrderStatus.ACCEPTED
                || status == OrderStatus.PREPARING
                || status == OrderStatus.READY_FOR_PICKUP;
    }

    private boolean isDeliveryPartnerStatus(
            OrderStatus status
    ) {

        return status == OrderStatus.OUT_FOR_DELIVERY
                || status == OrderStatus.DELIVERED;
    }
}