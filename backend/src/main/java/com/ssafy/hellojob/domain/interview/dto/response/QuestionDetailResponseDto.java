package com.ssafy.hellojob.domain.interview.dto.response;

import lombok.Builder;

@Builder
public class QuestionDetailResponseDto {
    private Integer questionBankId;
    private String question;
    private String memo;
}
