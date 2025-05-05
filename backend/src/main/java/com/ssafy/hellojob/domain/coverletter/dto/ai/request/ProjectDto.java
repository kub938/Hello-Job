package com.ssafy.hellojob.domain.coverletter.dto.ai.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDto {
    private String project_name;
    private String project_intro;
    private String project_role;
    private String project_skills;
    private String project_detail;
    private String project_client;
    private String project_start_date;
    private String project_end_date;
}
