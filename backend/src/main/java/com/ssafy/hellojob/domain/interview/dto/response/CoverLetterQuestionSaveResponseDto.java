package com.ssafy.hellojob.domain.interview.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoverLetterQuestionSaveResponseDto {

    private Integer coverLetterId;
    private Integer coverLetterInterviewId;
    private List<CoverLetterQuestionIdDto> coverLetterQuestionSaveId;

}
