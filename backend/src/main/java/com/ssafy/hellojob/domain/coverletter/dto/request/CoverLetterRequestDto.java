package com.ssafy.hellojob.domain.coverletter.dto.request;

import com.ssafy.hellojob.global.exception.ValidationMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CoverLetterRequestDto {
    @NotBlank(message = ValidationMessage.COVER_LETTER_TITLE_NOT_EMPTY)
    private String coverLetterTitle;
    @NotNull(message = ValidationMessage.COVER_LETTER_COMPANY_ANALYSIS_NOT_EMPTY)
    private Integer companyAnalysisId;

    private Integer jobRoleAnalysisId;
    private List<ContentsDto> contents;
}
