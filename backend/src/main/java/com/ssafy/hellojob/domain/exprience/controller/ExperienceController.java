package com.ssafy.hellojob.domain.exprience.controller;

import com.ssafy.hellojob.domain.exprience.dto.request.ExperienceRequestDto;
import com.ssafy.hellojob.domain.exprience.dto.response.ExperienceCreateResponseDto;
import com.ssafy.hellojob.domain.exprience.dto.response.ExperienceResponseDto;
import com.ssafy.hellojob.domain.exprience.service.ExperienceService;
import com.ssafy.hellojob.global.auth.token.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping
    public ResponseEntity<?> getExperiences(
            @AuthenticationPrincipal UserPrincipal principal) {
        Integer userId = principal.getUserId();

        return experienceService.getExperiences(userId);
    }

    @GetMapping("/{experienceId}")
    public ExperienceResponseDto getExperience(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer experienceId) {
        Integer userId = principal.getUserId();

        return experienceService.getExperience(userId, experienceId);
    }
}
