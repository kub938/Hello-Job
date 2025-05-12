package com.ssafy.hellojob.domain.interview.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InterviewQuestionAndAnswerRequestDto {

    private Integer interview_answer_id;
    private String interview_question;
    private String interview_answer;
    private String interview_question_category;


}