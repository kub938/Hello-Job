package com.ssafy.hellojob.domain.interview.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class SelectQuestionRequestDto {

    private Integer interviewVideoId;
    private List<Integer> questionIdList;

}
