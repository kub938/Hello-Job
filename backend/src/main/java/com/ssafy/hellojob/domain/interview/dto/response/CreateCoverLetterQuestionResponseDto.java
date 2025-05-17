package com.ssafy.hellojob.domain.interview.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCoverLetterQuestionResponseDto {

    private Integer coverLetterId;
    private List<String> coverLetterQuestion;

}
