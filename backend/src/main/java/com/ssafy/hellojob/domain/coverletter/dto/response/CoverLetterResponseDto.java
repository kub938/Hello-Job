package com.ssafy.hellojob.domain.coverletter.dto.response;

import com.ssafy.hellojob.domain.coverlettercontent.dto.response.CoverLetterContentDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.CoverLetterStatuses;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CoverLetterResponseDto {
    private Integer coverLetterId;
    private CoverLetterStatuses summary;
    private CoverLetterContentDto content;

    @Builder
    public CoverLetterResponseDto(Integer coverLetterId, CoverLetterStatuses summary, CoverLetterContentDto content) {
        this.coverLetterId = coverLetterId;
        this.summary = summary;
        this.content = content;
    }
}
