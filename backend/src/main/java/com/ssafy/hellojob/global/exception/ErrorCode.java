package com.ssafy.hellojob.global.exception;

import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // Global Exception
    BAD_REQUEST_ERROR(HttpStatus.BAD_REQUEST, "잘못된 요청입니다."),
    INVALID_HTTP_MESSAGE_BODY(HttpStatus.BAD_REQUEST,"HTTP 요청 바디의 형식이 잘못되었습니다."),
    UNSUPPORTED_HTTP_METHOD(HttpStatus.METHOD_NOT_ALLOWED,"지원하지 않는 HTTP 메서드입니다."),
    SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR,"서버 내부에서 알 수 없는 오류가 발생했습니다."),
    BIND_ERROR(HttpStatus.BAD_REQUEST, "요청 파라미터 바인딩에 실패했습니다."),
    ARGUMENT_TYPE_MISMATCH(HttpStatus.BAD_REQUEST, "요청 파라미터 타입이 일치하지 않습니다."),

    // 회원
    USER_NOT_FOUND(HttpStatus.BAD_REQUEST, "사용자를 찾을 수 없습니다."),

    // 인증
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    AUTH_NOT_FOUND(HttpStatus.UNAUTHORIZED, "인증 정보가 없습니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "토큰이 만료되었습니다."),

    /**
     Response의 에러 코드에 맞춰 HttpStatus를 설정해주시기 바랍니다.

     // fail
     BAD_REQUEST(400)
     UNAUTHORIZED(401)
     FORBIDDEN(403)
     NOT_FOUND(404)
     METHOD_NOT_ALLOWED(405)
     INTERNAL_SERVER_ERROR(500)

     **/

    ;

    private final HttpStatus httpStatus;
    private final String message;
}
