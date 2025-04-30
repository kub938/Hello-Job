package com.ssafy.hellojob.domain.jobroleanalysis.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class JobRoleAnalysisUpdateResponseDto {

    private Long jobRoleAnalysisId;

    @Builder
    public JobRoleAnalysisUpdateResponseDto(Long jobRoleAnalysisId){
        this.jobRoleAnalysisId = jobRoleAnalysisId;
    }


}
