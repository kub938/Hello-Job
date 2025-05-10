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
public class ExperienceFastAPIRequestDto {

    private String experience_name;
    private String experience_detail;
    private String experience_role;
    private LocalDate experience_start_date;
    private LocalDate experience_end_date;
    private String experience_client;

}
