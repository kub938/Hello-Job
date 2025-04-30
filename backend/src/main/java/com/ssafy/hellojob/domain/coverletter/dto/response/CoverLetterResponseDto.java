package com.ssafy.hellojob.domain.coverletter.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CoverLetterResponseDto {
    private Integer coverLetterId;
    private SummaryDto summary;
    private ContentDto content;

    @Builder
    public CoverLetterResponseDto(Integer coverLetterId, SummaryDto summary, ContentDto content) {
        this.coverLetterId = coverLetterId;
        this.summary = summary;
        this.content = content;
    }
}
