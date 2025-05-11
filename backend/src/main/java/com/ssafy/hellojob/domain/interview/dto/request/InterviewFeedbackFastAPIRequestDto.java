package com.ssafy.hellojob.domain.interview.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InterviewFeedbackFastAPIRequestDto {

    private List<InterviewQuestionAndAnswerRequestDto> interview_question_answer_pairs;
    private List<CoverLetterContentFastAPIRequestDto> cover_letter_contents;

}
