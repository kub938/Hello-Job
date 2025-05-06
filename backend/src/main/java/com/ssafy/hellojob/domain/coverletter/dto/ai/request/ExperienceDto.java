package com.ssafy.hellojob.domain.coverletter.dto.ai.request;

import com.ssafy.hellojob.domain.exprience.entity.Experience;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class ExperienceDto {
    private String experience_name;
    private String experience_detail;
    private String experience_role;
    private LocalDate experience_start_date;
    private LocalDate experience_end_date;
    private String experience_client;

    public static ExperienceDto from(Experience experience) {
        return ExperienceDto.builder()
                .experience_name(experience.getExperienceName())
                .experience_detail(experience.getExperienceDetail())
                .experience_role(experience.getExperienceRole())
                .experience_client(experience.getExperienceClient())
                .experience_start_date(experience.getExperienceStartDate())
                .experience_end_date(experience.getExperienceEndDate())
                .build();
    }
}
