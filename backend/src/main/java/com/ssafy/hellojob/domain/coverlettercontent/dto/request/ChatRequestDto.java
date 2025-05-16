package com.ssafy.hellojob.domain.coverlettercontent.dto.request;

import com.ssafy.hellojob.global.exception.ValidationMessage;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequestDto {
    @NotBlank(message = ValidationMessage.USER_MESSAGE_NOT_EMPTY)
    private String userMessage;
    @NotBlank(message = ValidationMessage.COVER_LETTER_CONTENT_DETAIL_NOT_EMPTY)
    private String contentDetail;
}
