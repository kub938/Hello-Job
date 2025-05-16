package com.ssafy.hellojob.domain.interview.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCoverLetterFastAPIRequestDto {

    private CoverLetterFastAPIRequestDto cover_letter;
    private List<ExperienceFastAPIRequestDto> experiences;
    private List<ProjectFastAPIRequestDto> projects;

}
