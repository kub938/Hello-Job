package com.ssafy.hellojob.domain.companyanalysis.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyAnalysisRequestDto {

    private Integer companyId;
    private boolean isPublic;
    private boolean basic;
    private boolean plus;
    private boolean financial;

}
