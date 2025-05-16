package com.ssafy.hellojob.domain.coverlettercontent.dto.ai.request;

import com.ssafy.hellojob.domain.coverlettercontent.entity.CoverLetterContent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AICoverLetterContentDto {
    private Integer content_number;
    private String content_question;
    private String cover_letter;
    private Integer content_length;

    public static AICoverLetterContentDto from(CoverLetterContent content) {
        return AICoverLetterContentDto.builder()
                .content_number(content.getContentNumber())
                .content_question(content.getContentQuestion())
                .cover_letter(content.getContentDetail())
                .content_length(content.getContentLength())
                .build();
    }
}
