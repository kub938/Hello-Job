package com.ssafy.hellojob.domain.coverletter.dto.ai.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AICoverLetterResponseDto {
    private int content_number;
    private String cover_letter;
}
