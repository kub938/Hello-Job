package com.ssafy.hellojob.domain.coverlettercontent.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class WholeCoverLetterContentDto {
    private Integer coverLetterId;
    private List<CoverLetterOnlyContentDto> contents;
    private boolean finish;
    private LocalDateTime updatedAt;
}
