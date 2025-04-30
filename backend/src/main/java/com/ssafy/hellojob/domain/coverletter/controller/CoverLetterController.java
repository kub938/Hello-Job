package com.ssafy.hellojob.domain.coverletter.controller;

import com.ssafy.hellojob.domain.coverletter.dto.request.CoverLetterRequestDto;
import com.ssafy.hellojob.domain.coverletter.dto.response.CoverLetterCreateResponseDto;
import com.ssafy.hellojob.domain.coverletter.dto.response.CoverLetterResponseDto;
import com.ssafy.hellojob.domain.coverletter.service.CoverLetterService;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.global.auth.token.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/cover-letter")
public class CoverLetterController {

    private final CoverLetterService coverLetterService;

    @PostMapping
    public CoverLetterCreateResponseDto createCoverLetter(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody CoverLetterRequestDto requestDto
            ) {
        User user = principal.getUser();

        return coverLetterService.createCoverLetter(user, requestDto);
    }

    @GetMapping("/{coverLetterId}/{contentNumber}")
    public CoverLetterResponseDto getCoverLetterContent(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("coverLetterId") Integer coverLetterId,
            @PathVariable("contentNumber") Integer contentNumber
    ) {
        User user = principal.getUser();
        return coverLetterService.getCoverLetterByContentNumber(user, coverLetterId, contentNumber);
    }
}
