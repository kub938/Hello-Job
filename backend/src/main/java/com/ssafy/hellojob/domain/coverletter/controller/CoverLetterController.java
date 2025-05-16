package com.ssafy.hellojob.domain.coverletter.controller;

import com.ssafy.hellojob.domain.coverletter.dto.request.CoverLetterRequestDto;
import com.ssafy.hellojob.domain.coverletter.dto.response.CoverLetterCreateResponseDto;
import com.ssafy.hellojob.domain.coverletter.dto.response.CoverLetterStatusesDto;
import com.ssafy.hellojob.domain.coverletter.dto.response.CoverLetterSummaryDto;
import com.ssafy.hellojob.domain.coverletter.service.CoverLetterService;
import com.ssafy.hellojob.global.auth.token.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/cover-letter")
public class CoverLetterController {

    private final CoverLetterService coverLetterService;

    @PostMapping
    public CoverLetterCreateResponseDto createCoverLetter(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CoverLetterRequestDto requestDto
    ) {
        Integer userId = principal.getUserId();

        return coverLetterService.createCoverLetter(userId, requestDto);
    }

    @GetMapping("/status/{coverLetterId}")
    public CoverLetterStatusesDto getCoverLetterStatuses(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer coverLetterId
    ) {
        Integer userId = principal.getUserId();
        return coverLetterService.getCoverLetterStatuses(userId, coverLetterId);
    }

    @GetMapping("/{coverLetterId}")
    public CoverLetterSummaryDto getCoverLetterSummary(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer coverLetterId
    ) {
        Integer userId = principal.getUserId();
        return coverLetterService.getCoverLetterSummary(userId, coverLetterId);
    }

    @PatchMapping("/{coverLetterId}")
    public Map<String, String> saveAll(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer coverLetterId
    ) {
        Integer userId = principal.getUserId();
        return coverLetterService.saveAll(userId, coverLetterId);
    }

    @DeleteMapping("/{coverLetterId}")
    public Map<String, String> deleteCoverLetter(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer coverLetterId
    ) {
        Integer userId = principal.getUserId();
        return coverLetterService.deleteCoverLetter(userId, coverLetterId);
    }
}
