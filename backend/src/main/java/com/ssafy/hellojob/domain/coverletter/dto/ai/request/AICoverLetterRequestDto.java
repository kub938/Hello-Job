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
    public AICoverLetterRequestDto(CompanyAnalysisDto company_analysis, JobRoleAnalysisDto job_role_analysis, List<ContentDto> contents) {
        this.company_analysis = company_analysis;
        this.job_role_analysis = job_role_analysis;
        this.contents = contents;
    }
}
