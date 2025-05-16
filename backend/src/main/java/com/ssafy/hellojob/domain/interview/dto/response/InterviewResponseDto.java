package com.ssafy.hellojob.domain.interview.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Builder
@Getter
public class InterviewResponseDto {

    private String type;
    private LocalDateTime start;
    private String firstQuestion;

}
