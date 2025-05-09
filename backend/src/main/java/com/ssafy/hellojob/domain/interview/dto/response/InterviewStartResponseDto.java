package com.ssafy.hellojob.domain.interview.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class InterviewStartResponseDto {

    private Integer interviewId;
    private Integer interviewVideoId;
    private List<QuestionAndAnswerListResponseDto> questionList;

}
