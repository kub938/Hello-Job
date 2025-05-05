package com.ssafy.hellojob.domain.coverletter.dto.ai.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceDto {
    private String experience_name;
    private String experience_detail;
    private String experience_role;
    private String experience_start_date;
    private String experience_end_date;
    private String experience_client;
}
