package com.ssafy.hellojob.domain.sse.controller;

import com.ssafy.hellojob.domain.sse.service.SSEService;
import com.ssafy.hellojob.global.auth.token.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sse")
public class SSEController {

    private final SSEService sseService;

    @GetMapping(value = "/sse/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@AuthenticationPrincipal UserPrincipal principal){
        Integer userId = principal.getUserId();
        SseEmitter emitter = new SseEmitter(60 * 1000L * 5); // 5분 유지

        sseService.addEmitter(userId, emitter);
        sseService.replayQueuedEvents(userId, emitter);

        return emitter;
    }
}
