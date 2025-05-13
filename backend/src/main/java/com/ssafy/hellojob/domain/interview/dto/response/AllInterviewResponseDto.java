package com.ssafy.hellojob.domain.interview.dto.response;

import lombok.Builder;

import java.util.List;

@Builder
public class AllInterviewResponseDto {
    private List<InterviewResponseDto> selectQuestionInterview;
    private List<InterviewResponseDto> simulateInterview;
}
