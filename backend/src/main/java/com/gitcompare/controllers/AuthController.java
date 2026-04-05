package com.gitcompare.controllers;

import com.gitcompare.dto.AuthResponse;
import com.gitcompare.dto.LoginRequest;
import com.gitcompare.dto.RegisterRequest;
import com.gitcompare.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/request-otp")
    public ResponseEntity<String> requestOtp(@RequestBody com.gitcompare.dto.OtpRequest request) {
        authService.requestOtp(request.getEmail());
        return ResponseEntity.ok("OTP sent successfully");
    }

    @PostMapping("/login-otp")
    public ResponseEntity<AuthResponse> loginOtp(@RequestBody com.gitcompare.dto.LoginOtpRequest request) {
        return ResponseEntity.ok(authService.loginWithOtp(request.getEmail(), request.getOtp()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody com.gitcompare.dto.OtpRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok("Reset OTP sent successfully");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody com.gitcompare.dto.ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok("Password reset successfully");
    }
}
