package com.ssafy.hellojob.domain.coverlettercontent.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoverLetterOnlyContentDto {
    private Integer contentId;
    private Integer contentNumber;
    private String contentQuestion;
    private String contentDetail;
    private Integer contentLength;
}
