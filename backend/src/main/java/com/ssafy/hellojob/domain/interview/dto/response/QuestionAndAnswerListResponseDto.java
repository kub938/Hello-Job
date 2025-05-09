package com.ssafy.hellojob.domain.interview.dto.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class QuestionAndAnswerListResponseDto {

    private Integer questionBankId;
    private Integer interviewAnswerId;
    private String question;

}
