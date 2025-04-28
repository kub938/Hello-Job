package com.ssafy.hellojob.domain.project.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class ProjectRequestDto {
    private String projectName;
    private String projectIntro;
    private String projectRole;
    private String projectSkills;
    private String projectDetail;
    private String projectClient;
    private LocalDate projectStartDate;
    private LocalDate projectEndDate;

    @Builder
    public ProjectRequestDto(String projectName, String projectIntro, String projectRole, String projectSkills, String projectDetail, String projectClient, LocalDate projectStartDate, LocalDate projectEndDate) {
        this.projectName = projectName;
        this.projectIntro = projectIntro;
        this.projectRole = projectRole;
        this.projectSkills = projectSkills;
        this.projectDetail = projectDetail;
        this.projectClient = projectClient;
        this.projectStartDate = projectStartDate;
        this.projectEndDate = projectEndDate;
    }
}
