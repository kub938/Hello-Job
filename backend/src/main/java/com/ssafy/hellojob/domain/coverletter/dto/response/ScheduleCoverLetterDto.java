package com.ssafy.hellojob.domain.coverletter.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ScheduleCoverLetterDto {
    private Integer coverLetterId;
    private String coverLetterTitle;
    private LocalDateTime updatedAt;
}
