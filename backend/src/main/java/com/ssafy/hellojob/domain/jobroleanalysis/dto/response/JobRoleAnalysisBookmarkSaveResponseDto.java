package com.ssafy.hellojob.domain.jobroleanalysis.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JobRoleAnalysisBookmarkSaveResponseDto {

    private Integer jobRoleAnalysisBookmarkId;
    private Integer jobRoleAnalysisId;

}
