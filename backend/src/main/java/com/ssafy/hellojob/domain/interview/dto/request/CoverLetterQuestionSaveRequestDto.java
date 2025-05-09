package com.ssafy.hellojob.domain.interview.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class CoverLetterQuestionSaveRequestDto {

    private Integer coverLetterId;
    private List<CoverLetterQuestionDto> coverLetterQuestion;


}
