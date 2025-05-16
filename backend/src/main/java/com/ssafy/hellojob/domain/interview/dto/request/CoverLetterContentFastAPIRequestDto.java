package com.ssafy.hellojob.domain.interview.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoverLetterContentFastAPIRequestDto {

    private Integer cover_letter_content_number;
    private String cover_letter_content_question;
    private String cover_letter_content_detail;

}
