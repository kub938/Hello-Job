package com.ssafy.hellojob.domain.coverletter.dto.ai.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AIUpdateCoverLetterResponseDto {
    private String user_message;
    private String ai_message;
}
