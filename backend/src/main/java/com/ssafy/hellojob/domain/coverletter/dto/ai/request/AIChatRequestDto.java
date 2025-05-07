package com.ssafy.hellojob.domain.coverletter.dto.ai.request;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AIChatRequestDto {
    private String user_message;
    private String cover_letter;
}
