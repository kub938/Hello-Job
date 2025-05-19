package com.ssafy.hellojob.domain.interview.dto.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class CsQuestionListResponseDto {

    private Integer questionBankId;
    private String question;
    private String category;

}
