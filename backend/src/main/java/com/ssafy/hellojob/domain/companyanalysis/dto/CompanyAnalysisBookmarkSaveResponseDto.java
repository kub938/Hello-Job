package com.ssafy.hellojob.domain.companyanalysis.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CompanyAnalysisBookmarkSaveResponseDto {

    private Long companyAnalysisBookmarkId;
    private Long companyAnalysisId;

    @Builder
    public CompanyAnalysisBookmarkSaveResponseDto(Long companyAnalysisBookmarkId, Long companyAnalysisId){
        this.companyAnalysisBookmarkId = companyAnalysisBookmarkId;
        this.companyAnalysisId = companyAnalysisId;
    }


}
