package com.ssafy.hellojob.domain.coverlettercontent.dto.ai.request;

import com.ssafy.hellojob.domain.coverletter.dto.ai.request.CompanyAnalysisDto;
import com.ssafy.hellojob.domain.coverletter.dto.ai.request.ExperienceDto;
import com.ssafy.hellojob.domain.coverletter.dto.ai.request.JobRoleAnalysisDto;
import com.ssafy.hellojob.domain.coverletter.dto.ai.request.ProjectDto;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AIChatForEditRequestDto {
    private CompanyAnalysisDto company_analysis;
    private JobRoleAnalysisDto job_role_analysis;
    private List<ExperienceDto> experiences;
    private List<ProjectDto> projects;
    private EditContentDto edit_content;
}
