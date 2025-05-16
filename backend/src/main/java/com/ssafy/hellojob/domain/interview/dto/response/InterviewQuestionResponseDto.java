package com.ssafy.hellojob.domain.interview.dto.response;

import com.ssafy.hellojob.domain.interview.entity.InterviewQuestionCategory;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class InterviewQuestionResponseDto {

    private Integer interviewAnswerId;
    private String interviewVideoUrl;
    private String videoLength;
    private String interviewQuestion;
    private InterviewQuestionCategory interviewQuestionCategory;

}
