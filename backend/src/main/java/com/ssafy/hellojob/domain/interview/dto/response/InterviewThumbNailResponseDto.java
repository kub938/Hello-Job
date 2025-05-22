package com.ssafy.hellojob.domain.interview.dto.response;

import com.ssafy.hellojob.domain.interview.entity.InterviewCategory;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Builder
@Getter
public class InterviewThumbNailResponseDto {
    private Integer interviewVideoId;
    private boolean feedbackEnd;
    private InterviewCategory interviewCategory;
    private boolean selectQuestion;
    private String interviewTitle;
    private LocalDateTime start;
    private String firstQuestion;
}
