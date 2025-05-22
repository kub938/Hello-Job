package com.ssafy.hellojob.global.filter;

import com.ssafy.hellojob.global.util.SseUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
public class SseExceptionFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        if (SseUtil.isSseRequest(request)) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            // 인증 정보가 없을 경우
            if (auth == null || !auth.isAuthenticated()) {
                // 이미 응답이 커밋됐다면 종료
                if (!response.isCommitted()) {
                    log.debug("❌ 인증되지 않은 SSE 요청 차단: {}", request.getRequestURI());
                    // 클라이언트에게 에러 이벤트 전송
                    SseUtil.writeSseError(response, HttpServletResponse.SC_UNAUTHORIZED, "SSE Unauthorized\n\n");
                }
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

}
