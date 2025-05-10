package com.ssafy.hellojob.domain.interview.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoverLetterFastAPIRequestDto {

    private Integer cover_letter_id;
    private List<CoverLetterContentFastAPIRequestDto> cover_letter_contents;

}
