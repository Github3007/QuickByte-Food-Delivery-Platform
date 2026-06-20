package com.shiva.quickbite.repository;

import com.shiva.quickbite.dto.PagedResponse;
import com.shiva.quickbite.entity.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuItemRepository
        extends JpaRepository<MenuItem, Long> {

    Page<MenuItem> findByRestaurantId(Long restaurantId, Pageable pageable);
}