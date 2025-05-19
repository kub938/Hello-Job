package com.ssafy.hellojob.domain.coverlettercontent.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class CoverLetterContentDto {
    private Integer contentId;
    private String contentQuestion;
    private Integer contentNumber;
    private Integer contentLength;
    private String contentDetail;
    private List<Integer> contentExperienceIds;
    private List<Integer> contentProjectIds;
    private String contentFirstPrompt;
    private List<ChatMessageDto> contentChatLog;
    private LocalDateTime contentUpdatedAt;
}
