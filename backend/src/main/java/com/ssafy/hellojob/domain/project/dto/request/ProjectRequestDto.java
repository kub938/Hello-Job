package com.ssafy.hellojob.domain.project.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRequestDto {
    private String projectName;
    private String projectIntro;
    private String projectRole;
    private String projectSkills;
    private String projectDetail;
    private String projectClient;
    private LocalDate projectStartDate;
    private LocalDate projectEndDate;
}
