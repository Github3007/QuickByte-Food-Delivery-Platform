package com.shiva.quickbite.repository;

import com.shiva.quickbite.entity.Order;
import com.shiva.quickbite.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository
        extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {
            "orderItems",
            "orderItems.menuItem",
            "customer",
            "restaurant"
    })
    Page<Order> findByCustomerId(Long customerId,  Pageable pageable);

    @EntityGraph(attributePaths = {
            "orderItems",
            "orderItems.menuItem",
            "customer",
            "restaurant"
    })
    Page<Order> findByRestaurantOwnerId(Long ownerId, Pageable pageable);

    @EntityGraph(attributePaths = {
            "orderItems",
            "orderItems.menuItem",
            "customer",
            "restaurant"
    })
    Page<Order> findByStatus(OrderStatus status,  Pageable pageable);

    @EntityGraph(attributePaths = {
            "orderItems",
            "orderItems.menuItem",
            "customer",
            "restaurant"
    })
    List<Order> findByDeliveryPartnerId(Long partnerId);
}