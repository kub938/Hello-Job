package com.ssafy.hellojob.domain.interview.dto.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class SelectInterviewStartResponseDto {

    private Integer interviewId;
    private Integer interviewVideoId;

}
