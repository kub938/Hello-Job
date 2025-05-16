package com.ssafy.hellojob.domain.interview.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectFastAPIRequestDto {

    private String project_name;
    private String project_intro;
    private String project_role;
    private String project_skills;
    private String project_detail;
    private String project_client;
    private LocalDate project_start_date;
    private LocalDate project_end_date;

}