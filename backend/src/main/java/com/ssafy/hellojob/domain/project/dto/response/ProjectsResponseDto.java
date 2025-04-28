package com.ssafy.hellojob.domain.project.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class ProjectsResponseDto {
    private Integer projectId;
    private String projectName;
    private LocalDate projectStartDate;
    private LocalDate projectEndDate;

    @Builder
    public ProjectsResponseDto(Integer projectId, String projectName, LocalDate projectStartDate, LocalDate projectEndDate) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.projectStartDate = projectStartDate;
        this.projectEndDate = projectEndDate;
    }
}
