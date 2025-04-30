package com.ssafy.hellojob.domain.companyanalysis.dto;

import com.ssafy.hellojob.global.exception.ValidationMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CompanyAnalysisBookmarkSaveRequestDto {

    @NotNull(message = ValidationMessage.COMPANY_ANALYSIS_BOOKMARK_COMPANY_ANALYSIS_ID_NOT_EMPTY)
    private Long companyAnalysisId;

    @Builder
    public CompanyAnalysisBookmarkSaveRequestDto(Long companyAnalysisId){
        this.companyAnalysisId = companyAnalysisId;
    }

}
