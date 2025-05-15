package com.ssafy.hellojob.domain.interview.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Builder
@Getter
public class AllInterviewResponseDto {
    private List<InterviewResponseDto> selectQuestionInterview;
    private List<InterviewResponseDto> simulateInterview;
}
