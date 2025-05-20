package com.ssafy.hellojob.global.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
public class SseLoggingSuppressFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            filterChain.doFilter(request, response);
        } catch (AccessDeniedException ex) {
            String accept = request.getHeader("Accept");
            if (accept != null && accept.contains("text/event-stream") && response.isCommitted()) {
                // sse 에러인 경우 에러 무시
                log.debug("SSE 요청에서 AccessDenied 발생");
                // 커밋된 상태면 아무것도 안 함
            }
            throw ex;
        }
    }
}
