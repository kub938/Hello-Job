package com.ssafy.hellojob.domain.coverlettercontent.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CoverLetterOnlyContentDto {
    private Integer contentId;
    private int contentNumber;
    private String contentQuestion;
    private String contentDetail;
    private int contentLength;
}
