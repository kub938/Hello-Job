package com.ssafy.hellojob.domain.sse.controller;

import com.ssafy.hellojob.domain.sse.dto.AckRequestDto;
import com.ssafy.hellojob.domain.sse.service.SSEService;
import com.ssafy.hellojob.global.auth.token.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/sse")
public class SSEController {

    private final SSEService sseService;

    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null || principal.getUserId() == null) {
            log.warn("❌ 인증되지 않은 사용자 SSE 요청");
            throw new AccessDeniedException("SSE 연결 전 인증 필요");
        }
        Integer userId = principal.getUserId();
        log.debug("✅ SSE 연결 성공 userId={}", userId);
        SseEmitter emitter = new SseEmitter(60 * 1000L * 5); // 5분 유지

        sseService.addEmitter(userId, emitter);
        sseService.replayQueuedEvents(userId, emitter);

        return emitter;
    }

    @PostMapping(value = "/ack")
    public ResponseEntity<Void> ackEvent(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody AckRequestDto dto) {
        Integer userId = principal.getUserId();
        sseService.removeTargetEvent(userId, dto);
        return ResponseEntity.noContent().build();
    }
}
