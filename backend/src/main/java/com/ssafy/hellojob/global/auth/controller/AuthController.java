package com.ssafy.hellojob.global.auth.controller;

import com.ssafy.hellojob.global.auth.dto.LoginDto;
import com.ssafy.hellojob.global.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    @GetMapping("/login")
    public LoginDto checkLogin(@CookieValue(value = "access_token") String accessToken) {
        return authService.loginStatus(accessToken);
    }

}
