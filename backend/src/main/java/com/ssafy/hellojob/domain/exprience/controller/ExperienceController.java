package com.ssafy.hellojob.domain.exprience.controller;

import com.ssafy.hellojob.domain.exprience.dto.request.ExperienceRequestDto;
import com.ssafy.hellojob.domain.exprience.dto.response.ExperienceCreateResponseDto;
import com.ssafy.hellojob.domain.exprience.service.ExperienceService;
import com.ssafy.hellojob.global.auth.token.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/experience")
public class ExperienceController {

    private final ExperienceService experienceService;

    @PostMapping
    public ExperienceCreateResponseDto createExperience(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ExperienceRequestDto requestDto) {
        Integer userId = principal.getUserId();

        return experienceService.createExperience(userId, requestDto);
    }
}
