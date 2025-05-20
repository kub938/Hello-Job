package com.ssafy.hellojob.global.exception.handler;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
public class SseAccessDeniedHandler implements AccessDeniedHandler {
    // SSE 스트리밍 응답 시작 후 인증/인가 에러 발생한 경우
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("text/event-stream")) {
            // sse 에러인 경우 에러 무시
            log.debug("SSE 요청에서 AccessDenied 발생");
            return;
        }
        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied");
    }

    ;
}

