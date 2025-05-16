package com.ssafy.hellojob.domain.interview.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class CreateCoverLetterFastAPIResponseDto {

    private Integer cover_letter_id;
    private List<String> expected_questions;

}
