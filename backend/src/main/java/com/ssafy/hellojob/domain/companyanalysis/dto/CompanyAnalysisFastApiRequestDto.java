package com.ssafy.hellojob.domain.companyanalysis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class CompanyAnalysisFastApiRequestDto {

    private String companyName;
    private boolean base;
    private boolean plus;
    private boolean fin;

}