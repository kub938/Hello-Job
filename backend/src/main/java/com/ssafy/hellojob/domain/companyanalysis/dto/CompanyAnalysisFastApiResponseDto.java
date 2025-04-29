package com.ssafy.hellojob.domain.companyanalysis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class CompanyAnalysisFastApiResponseDto {

    private String companyName;
    private Date analysisDate;
    private String companyBrand;
    private String companyAnalysis;
    private String companyVision;
    private String newsSummary;
    private List<String> newsUrls;

}
