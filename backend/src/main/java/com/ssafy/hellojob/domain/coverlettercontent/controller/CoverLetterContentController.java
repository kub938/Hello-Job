package com.ssafy.hellojob.domain.coverlettercontent.controller;

import com.ssafy.hellojob.domain.coverlettercontent.dto.request.ChatRequestDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.request.CoverLetterUpdateRequestDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.response.ChatResponseDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.response.CoverLetterContentDto;
import com.ssafy.hellojob.domain.coverlettercontent.service.CoverLetterContentService;
import com.ssafy.hellojob.global.auth.token.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("api/v1/cover-letter-content")
@RequiredArgsConstructor
public class CoverLetterContentController {

    private final CoverLetterContentService coverLetterContentService;

    @GetMapping("/{contentId}")
    public CoverLetterContentDto getCoverLetterContent(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer contentId) {
        Integer userId = principal.getUserId();
        CoverLetterContentDto response = coverLetterContentService.getCoverLetterContent(userId, contentId);
        return response;
    }

    @PatchMapping("/{contentId}")
    public Map<String, String> updateCoverLetterContent(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer contentId,
            @Valid @RequestBody CoverLetterUpdateRequestDto requestDto
    ) {
        Integer userId = principal.getUserId();
        return coverLetterContentService.updateCoverLetterContent(userId, contentId, requestDto);
    }

    @PostMapping("/{contentId}/edit")
    public ChatResponseDto sendChatFotEdit(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer contentId,
            @Valid @RequestBody ChatRequestDto requestDto
            ) {
        Integer userId = principal.getUserId();
        return coverLetterContentService.getAIChatForEdit(userId, contentId, requestDto);
    }

    @PostMapping("/{contentId}/chat")
    public ChatResponseDto sendChat(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer contentId,
            @Valid @RequestBody ChatRequestDto requestDto
    ) {
        Integer userId = principal.getUserId();
        return coverLetterContentService.sendChat(userId, contentId, requestDto);
    }
}
