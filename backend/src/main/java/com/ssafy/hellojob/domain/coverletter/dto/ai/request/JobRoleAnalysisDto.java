package com.ssafy.hellojob.domain.coverletter.dto.ai.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class JobRoleAnalysisDto {
    private String job_role_name;
    private String job_role_title;
    private String job_role_work;
    private String job_role_skills;
    private String job_role_requirements;
    private String job_role_preferences;
    private String job_role_etc;
    private String job_role_category;
}
