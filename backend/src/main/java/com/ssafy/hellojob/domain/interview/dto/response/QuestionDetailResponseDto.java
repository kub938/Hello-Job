package com.ssafy.hellojob.domain.interview.dto.response;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class QuestionDetailResponseDto {
    private Integer questionBankId;
    private String question;
    private String memo;
}
