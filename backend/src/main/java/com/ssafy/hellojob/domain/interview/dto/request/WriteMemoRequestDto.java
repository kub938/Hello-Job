package com.ssafy.hellojob.domain.interview.dto.request;

import com.ssafy.hellojob.global.exception.ValidationMessage;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class WriteMemoRequestDto {
    private Integer questionBankId;
    private Integer interviewId;

    @NotBlank(message = ValidationMessage.MEMO_NOT_EMPTY)
    private String memo;
}
