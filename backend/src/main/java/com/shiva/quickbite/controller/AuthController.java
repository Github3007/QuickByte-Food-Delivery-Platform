package com.shiva.quickbite.controller;

import com.shiva.quickbite.dto.AuthResponse;
import com.shiva.quickbite.dto.LoginRequest;
import com.shiva.quickbite.dto.RegisterRequest;
import com.shiva.quickbite.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }
    
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}