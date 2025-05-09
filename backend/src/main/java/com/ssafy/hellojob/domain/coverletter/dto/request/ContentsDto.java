package com.ssafy.hellojob.domain.coverletter.dto.request;

import com.ssafy.hellojob.global.exception.ValidationMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ContentsDto {
    @NotBlank(message = ValidationMessage.COVER_LETTER_CONTENT_QUESTION)
    private String contentQuestion;
    @NotNull(message = ValidationMessage.COVER_LETTER_CONTENT_NUMBER)
    private int contentNumber;

    private List<Integer> contentExperienceIds;
    private List<Integer> contentProjectIds;
    private int contentLength;
    private String contentFirstPrompt;

    @Builder
    public ContentsDto(String contentQuestion, int contentNumber, List<Integer> contentExperienceIds, List<Integer> contentProjectIds, int contentLength, String contentFirstPrompt) {
        this.contentQuestion = contentQuestion;
        this.contentNumber = contentNumber;
        this.contentExperienceIds = contentExperienceIds;
        this.contentProjectIds = contentProjectIds;
        this.contentLength = contentLength;
        this.contentFirstPrompt = contentFirstPrompt;
    }
}
