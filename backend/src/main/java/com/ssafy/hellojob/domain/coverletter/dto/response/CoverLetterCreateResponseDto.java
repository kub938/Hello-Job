package com.ssafy.hellojob.domain.coverletter.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CoverLetterCreateResponseDto {
    private Integer coverLetterId;
    private String message = "자기소개서 초안이 작성되었습니다.";

    @Builder
    public CoverLetterCreateResponseDto(Integer coverLetterId) {
        this.coverLetterId = coverLetterId;
    }
}
