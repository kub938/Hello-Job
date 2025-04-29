package com.ssafy.hellojob.domain.jobroleanalysis.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class JobRoleAnalysisBookmarkSaveResponseDto {

    private Long jobRoleAnalysisBookmarkId;
    private Long jobRoleAnalysisId;

    @Builder
    public JobRoleAnalysisBookmarkSaveResponseDto(Long jobRoleAnalysisBookmarkId, Long jobRoleAnalysisId){
        this.jobRoleAnalysisBookmarkId = jobRoleAnalysisBookmarkId;
        this.jobRoleAnalysisId = jobRoleAnalysisId;
    }


}
