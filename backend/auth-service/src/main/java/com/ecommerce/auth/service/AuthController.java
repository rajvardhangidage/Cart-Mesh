package com.ecommerce.auth.service;

import com.ecommerce.common.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import org.springframework.http.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user registration and JWT authentication")
public class AuthController {
    final UserRepository repo;
    final BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
    final String secret;

    AuthController(UserRepository r, @org.springframework.beans.factory.annotation.Value("${app.jwt.secret}") String s) {
        repo = r;
        secret = s;
    }

    record Signup(@Email @NotBlank String email, @Size(min = 8, max = 72) String password) {}
    record Login(@Email @NotBlank String email, @NotBlank String password) {}
    record Token(String accessToken, String tokenType, UUID userId, String role) {}

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new customer or vendor account")
    ResponseEntity<?> register(@RequestBody Signup x) {
        if (repo.findByEmailIgnoreCase(x.email()).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("error", "Email already registered"));
        }
        User u = new User();
        u.setEmail(x.email().toLowerCase(Locale.ROOT));
        u.setPasswordHash(enc.encode(x.password()));
        repo.save(u);
        return ResponseEntity.status(201).body(Map.of("userId", u.getId(), "email", u.getEmail(), "role", u.getRole()));
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticates credentials and issues a JWT Bearer token")
    Token login(@RequestBody Login x) {
        User u = repo.findByEmailIgnoreCase(x.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!enc.matches(x.password(), u.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        return new Token(JwtUtil.create(secret, u.getId().toString(), u.getRole(), 3600), "Bearer", u.getId(), u.getRole());
    }
}