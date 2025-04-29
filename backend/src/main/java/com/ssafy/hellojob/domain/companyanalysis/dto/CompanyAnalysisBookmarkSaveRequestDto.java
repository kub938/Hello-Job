package com.ssafy.hellojob.domain.companyanalysis.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CompanyAnalysisBookmarkSaveRequestDto {

    private Long companyAnalysisId;

    @Builder
    public CompanyAnalysisBookmarkSaveRequestDto(Long companyAnalysisId){
        this.companyAnalysisId = companyAnalysisId;
    }

}
