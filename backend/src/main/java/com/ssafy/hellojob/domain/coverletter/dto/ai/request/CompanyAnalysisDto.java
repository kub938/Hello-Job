package com.ssafy.hellojob.domain.coverletter.dto.ai.request;

import com.ssafy.hellojob.domain.companyanalysis.entity.CompanyAnalysis;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CompanyAnalysisDto {
    private String company_name;
    private String company_brand;
    private String company_analysis;
    private String company_vision;
    private String company_finance;
    private LocalDateTime created_at;
    private String news_analysis_data;
    private SWOTDto swot;

    public static CompanyAnalysisDto from(CompanyAnalysis companyAnalysis, SWOTDto swot) {
        return CompanyAnalysisDto.builder()
                .company_name(companyAnalysis.getCompany().getCompanyName())
                .company_analysis(companyAnalysis.getDartAnalysis().getDartCompanyAnalysis())
                .company_brand(companyAnalysis.getDartAnalysis().getDartBrand())
                .company_finance(companyAnalysis.getDartAnalysis().getDartFinancialSummary())
                .company_vision(companyAnalysis.getDartAnalysis().getDartVision())
                .created_at(companyAnalysis.getCreatedAt())
                .news_analysis_data(companyAnalysis.getNewsAnalysis().getNewsAnalysisData())
                .swot(swot)
                .build();
    }
}
