package com.ssafy.hellojob.domain.coverletter.dto.response;

import com.ssafy.hellojob.domain.coverletter.entity.CoverLetterContentStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
public class ContentDto {
    private String contentQuestion;
    private int contentNumber;
    private int contentLength;
    private String contentDetail;
    private List<Integer> contentExperienceIds;
    private List<Integer> contentProjectIds;
    private String contentFirstPrompt;
    private CoverLetterContentStatus contentStatus;
    private List<ChatMessageDto> contentChatLog;
    private LocalDateTime contentUpdatedAt;

    @Builder
    public ContentDto(String contentQuestion, int contentNumber, int contentLength, String contentDetail, List<Integer> contentExperienceIds, List<Integer> contentProjectIds, String contentFirstPrompt, CoverLetterContentStatus contentStatus, List<ChatMessageDto> contentChatLog, LocalDateTime contentUpdatedAt) {
        this.contentQuestion = contentQuestion;
        this.contentNumber = contentNumber;
        this.contentLength = contentLength;
        this.contentDetail = contentDetail;
        this.contentExperienceIds = contentExperienceIds;
        this.contentProjectIds = contentProjectIds;
        this.contentFirstPrompt = contentFirstPrompt;
        this.contentStatus = contentStatus;
        this.contentChatLog = contentChatLog;
        this.contentUpdatedAt = contentUpdatedAt;
    }
}
