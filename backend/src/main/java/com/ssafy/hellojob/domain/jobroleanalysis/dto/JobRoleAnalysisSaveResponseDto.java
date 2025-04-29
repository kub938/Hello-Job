package com.ssafy.hellojob.domain.jobroleanalysis.dto;

import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class JobRoleAnalysisSaveResponseDto {

    private Long jobRoleAnalysisId;

    @Builder
    public JobRoleAnalysisSaveResponseDto(Long jobRoleAnalysisId){
        this.jobRoleAnalysisId = jobRoleAnalysisId;
    }

}
