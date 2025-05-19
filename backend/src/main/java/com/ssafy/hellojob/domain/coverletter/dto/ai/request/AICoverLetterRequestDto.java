package com.ssafy.hellojob.domain.coverletter.dto.ai.request;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class AICoverLetterRequestDto {
    private CompanyAnalysisDto company_analysis;
    private JobRoleAnalysisDto job_role_analysis;
    private List<ContentDto> contents;

    @Builder
    public AICoverLetterRequestDto(CompanyAnalysisDto companyAnalysis, JobRoleAnalysisDto jobRoleAnalysis, List<ContentDto> contents) {
        this.company_analysis = companyAnalysis;
        this.job_role_analysis = jobRoleAnalysis;
        this.contents = contents;
    }
}
