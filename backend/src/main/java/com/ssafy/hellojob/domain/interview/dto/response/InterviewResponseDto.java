package com.ssafy.hellojob.domain.interview.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public class InterviewResponseDto {

    private String interviewVideoUrl;
    private LocalDateTime start;
    private String videoLength;
    private String firstQuestion;

}
