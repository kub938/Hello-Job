package com.ssafy.hellojob.domain.interview.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InterviewFeedbackResponseDto {

    private Integer interviewVideoId;
    private String interviewFeedback;
    private String interviewTitle;
    private LocalDate date;
    private String interviewQuestionCategory;
    private String interviewCategory;
    private List<InterviewFeedbackDetailDto> interviewFeedbackList;

}
