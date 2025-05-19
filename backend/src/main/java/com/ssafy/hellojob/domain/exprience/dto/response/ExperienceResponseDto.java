package com.ssafy.hellojob.domain.exprience.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class ExperienceResponseDto {
    private Integer experienceId;
    private String experienceName;
    private String experienceDetail;
    private String experienceRole;
    private String experienceClient;
    private LocalDate experienceStartDate;
    private LocalDate experienceEndDate;
    private LocalDateTime updatedAt;
}
