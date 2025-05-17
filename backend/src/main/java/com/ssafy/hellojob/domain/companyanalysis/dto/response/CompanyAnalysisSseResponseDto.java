package com.ssafy.hellojob.domain.companyanalysis.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CompanyAnalysisSseResponseDto {
    private Integer companyId;
    private Integer companyAnalysisId;
}
