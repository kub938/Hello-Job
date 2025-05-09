package com.ssafy.hellojob.global.exception.handler;

import com.ssafy.hellojob.global.auth.token.UserPrincipal;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.validation.BindException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import static com.ssafy.hellojob.global.exception.ErrorCode.*;

@RestControllerAdvice
@Slf4j
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    public static final String MESSAGE_KEY = "message";

    @Value("${notification.mattermost.enabled:false}")
    private boolean mattermostEnabled;

    @Value("${notification.mattermost.webhook-url:}")
    private String mattermostWebhookUrl;

    private final RestTemplate restTemplate;

    // javax.validation.Valid or @Validated 으로 binding error 발생시 발생
    // 주로 @RequestBody, @RequestPart 어노테이션에서 발생
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        log.warn("요청 바디 검증 실패: {}", e.getMessage());
        Map<String, String> body = Map.of( MESSAGE_KEY,  INVALID_HTTP_MESSAGE_BODY.getMessage());
        return ResponseEntity
                .status(INVALID_HTTP_MESSAGE_BODY.getHttpStatus())
                .body(body);
    }


    // @ModelAttribute 으로 binding error 발생시 BindException 발생
    @ExceptionHandler(BindException.class)
    public ResponseEntity<Map<String, String>> handleBindException(BindException e) {
        log.warn("요청 파라미터 바인딩 실패: {}", e.getMessage());
        Map<String, String> body = Map.of( MESSAGE_KEY, BIND_ERROR.getMessage());
        return ResponseEntity
                .status(BIND_ERROR.getHttpStatus())
                .body(body);
    }

    // enum type 일치하지 않아 binding 못할 경우 발생
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException e) {
        log.warn("요청 파라미터 타입 불일치. 파라미터명: {}, 오류: {}", e.getName(), e.getMessage());
        Map<String, String> body = Map.of(MESSAGE_KEY, ARGUMENT_TYPE_MISMATCH.getMessage());
        return ResponseEntity
                .status(ARGUMENT_TYPE_MISMATCH.getHttpStatus())
                .body(body);
    }

    // 지원하지 않은 HTTP method 호출 할 경우 발생
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, String>> handleHttpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException e) {
        log.warn("지원하지 않는 HTTP 메서드 호출: {}. 오류: {}", e.getMethod(), e.getMessage());
        Map<String, String> body = Map.of(MESSAGE_KEY, UNSUPPORTED_HTTP_METHOD.getMessage());
        return ResponseEntity
                .status(UNSUPPORTED_HTTP_METHOD.getHttpStatus())
                .body(body);
    }

    // request 값을 읽을 수 없을 때 발생
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleHttpMessageNotReadableException(HttpMessageNotReadableException e) {
        log.warn("HTTP 메시지를 읽는 도중 오류 발생: {}", e.getMessage());
        Map<String, String> body = Map.of(MESSAGE_KEY, BAD_REQUEST_ERROR.getMessage());
        return ResponseEntity
                .status(BAD_REQUEST_ERROR.getHttpStatus())
                .body(body);
    }

    // 비즈니스 로직 에러
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<Map<String, String>> handleBaseException(BaseException e, WebRequest request) {
        // 요청 URL 정보 가져오기
        String requestUrl = extractRequestUrl(request);
        String httpMethod = extractHttpMethod(request);

        // 현재 인증된 사용자 정보 가져오기
        String username = "비로그인 사용자";
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {

            Object principal = authentication.getPrincipal();
            if (principal instanceof UserPrincipal) {
                UserPrincipal userPrincipal = (UserPrincipal) principal;
                username = userPrincipal.getName();
            } else {
                username = authentication.getName();
            }
        }
//        log.error("비즈니스 로직 처리 중 오류 발생. 에러 코드: {}, 메시지: {}", e.getErrorCode(), e.getMessage());
        log.error("비즈니스 로직 처리 중 오류 발생. 사용자: {}, URL: {}, 메서드: {}, 에러 코드: {}, 메시지: {}",
                username, requestUrl, httpMethod, e.getErrorCode(), e.getMessage());

        if (mattermostEnabled && StringUtils.hasText(mattermostWebhookUrl)) {
            sendMattermostNotification(e, requestUrl, httpMethod, username);
        }

        ErrorCode errorCode = e.getErrorCode();
        Map<String, String> body = Map.of(
                MESSAGE_KEY, errorCode.getMessage()
        );
        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(body);
    }

    // 요청 URL 추출 메서드
    private String extractRequestUrl(WebRequest request) {
        if (request instanceof ServletWebRequest) {
            ServletWebRequest servletRequest = (ServletWebRequest) request;
            return servletRequest.getRequest().getRequestURL().toString();
        }
        return "Unknown URL";
    }

    // HTTP 메서드 추출 메서드
    private String extractHttpMethod(WebRequest request) {
        if (request instanceof ServletWebRequest) {
            ServletWebRequest servletRequest = (ServletWebRequest) request;
            return servletRequest.getHttpMethod() != null ? servletRequest.getHttpMethod().toString() : "Unknown";
        }
        return "Unknown Method";
    }

    // Mattermost 알림 전송 메서드 (사용자 파라미터 추가)
    private void sendMattermostNotification(BaseException e, String requestUrl, String httpMethod, String username) {
        try {
            // Mattermost 메시지 구성
            Map<String, Object> message = new HashMap<>();
            message.put("text", String.format("❌ 백엔드 에러 발생!\n" +
                            "**사용자**: %s\n" +  // 사용자 정보 추가
                            "**URL**: %s %s\n" +
                            "**에러 코드**: %s\n" +
                            "**HTTP 상태**: %s\n" +
                            "**메시지**: %s\n" +
                            "**시간**: %s",
                    username,  // 사용자 정보 추가
                    httpMethod,
                    requestUrl,
                    e.getErrorCode(),
                    e.getErrorCode().getHttpStatus(),
                    e.getMessage(),
                    LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)));

            // 색상 설정 (빨간색)
            List<Map<String, Object>> attachments = new ArrayList<>();
            Map<String, Object> attachment = new HashMap<>();
            attachment.put("color", "#FF0000");
            attachments.add(attachment);
            message.put("attachments", attachments);

            // 비동기로 알림 전송 (메인 요청 처리를 지연시키지 않기 위함)
            CompletableFuture.runAsync(() -> {
                try {
                    restTemplate.postForEntity(mattermostWebhookUrl, message, String.class);
                } catch (Exception ex) {
                    log.error("Mattermost 알림 전송 실패", ex);
                }
            });
        } catch (Exception ex) {
            // 알림 전송 실패해도 원래 에러 처리는 계속 진행
            log.error("Mattermost 알림 구성 중 오류 발생", ex);
        }
    }

}
