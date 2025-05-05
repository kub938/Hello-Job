package com.ssafy.hellojob.domain.coverletter.dto.ai.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ContentDto {
    private String content_number;
    private String content_question;
    private String content_length;
    private String content_prompt;
    private List<ExperienceDto> experiences;
    private List<ProjectDto> projects;
}
