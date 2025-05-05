package com.ssafy.hellojob.domain.coverletter.dto.ai.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CompanyAnalysisDto {
    private String company_name;
    private String company_brand;
    private String company_analysis;
    private String company_vision;
    private String company_finance;
    private LocalDate created_at;
    private String news_analysis_data;
}
