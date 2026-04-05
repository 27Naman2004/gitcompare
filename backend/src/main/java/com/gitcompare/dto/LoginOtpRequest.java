package com.gitcompare.dto;

import lombok.Data;

@Data
public class LoginOtpRequest {
    private String email;
    private String otp;
}
