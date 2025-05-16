package com.ssafy.hellojob.domain.interview.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class InterviewFeedbackFastAPIResponseDto {

    private List<SingleInterviewFeedbackFastAPIResponseDto> single_feedbacks;
    private String overall_feedback;

}


