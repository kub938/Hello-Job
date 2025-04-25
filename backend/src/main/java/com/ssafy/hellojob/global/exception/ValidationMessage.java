package com.ssafy.hellojob.global.exception;


public final class ValidationMessage {

    private ValidationMessage() {}
    // Auth
    public static final String REFRESH_TOKEN_NOT_EMPTY = "refresh token은 필수값 입니다.";

    // User
    public static final String NICKNAME_NOT_EMPTY = "닉네임은 필수값 입니다.";
    public static final String ERROR_NICKNAME_LENGTH = "길이를 초과했습니다.";
    public static final String ERROR_NICKNAME_FORMAT = "성은 숫자나 특수문자를 포함할 수 없습니다.";
}
