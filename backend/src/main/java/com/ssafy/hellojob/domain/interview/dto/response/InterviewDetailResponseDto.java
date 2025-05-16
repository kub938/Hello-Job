package com.ssafy.hellojob.domain.interview.dto.response;

import com.ssafy.hellojob.domain.interview.entity.InterviewCategory;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@Getter
public class InterviewDetailResponseDto {

    private Integer interviewVideoId;
    private InterviewCategory interviewCategory;
    private boolean selectQuestion;
    private String interviewTitle;
    private LocalDateTime start;
    private List<InterviewQuestionResponseDto> questions;

}
