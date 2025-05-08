package com.ssafy.hellojob.domain.coverletter.dto.ai.request;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ContentDto {
    private int content_number;
    private String content_question;
    private int content_length;
    private String content_prompt;
    private List<ExperienceDto> experiences;
    private List<ProjectDto> projects;
}
