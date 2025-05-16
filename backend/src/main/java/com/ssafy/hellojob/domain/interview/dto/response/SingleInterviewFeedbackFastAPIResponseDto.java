package com.ssafy.hellojob.domain.interview.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class SingleInterviewFeedbackFastAPIResponseDto {

    private Integer interview_answer_id;
    private String feedback;
    private List<String> follow_up_questions;

}
