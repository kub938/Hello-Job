package com.ssafy.hellojob.domain.coverletter.dto.ai.request;

import com.ssafy.hellojob.domain.project.entity.Project;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class ProjectDto {
    private String project_name;
    private String project_intro;
    private String project_role;
    private String project_skills;
    private String project_detail;
    private String project_client;
    private LocalDate project_start_date;
    private LocalDate project_end_date;

    public static ProjectDto from(Project project) {
        return ProjectDto.builder()
                .project_name(project.getProjectName())
                .project_intro(project.getProjectIntro())
                .project_role(project.getProjectRole())
                .project_skills(project.getProjectSkills())
                .project_detail(project.getProjectDetail())
                .project_client(project.getProjectClient())
                .project_start_date(project.getProjectStartDate())
                .project_end_date(project.getProjectEndDate())
                .build();
    }
}
