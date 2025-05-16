package com.ssafy.hellojob.domain.coverlettercontent.dto.ai.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AIChatResponseDto {
    private String status;
    private String user_message;
    private String ai_message;
}
