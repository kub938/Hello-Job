package com.ssafy.hellojob.domain.coverletter.dto.ai.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AIUpdateCoverLetterRequestDto {
    private String user_message;
    private String cover_letter;
}
