package com.ssafy.hellojob.domain.interview.dto.request;

import com.ssafy.hellojob.global.exception.ValidationMessage;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StartCoverLetterInterviewRequestDto {

    @NotNull(message = ValidationMessage.COVER_LETTER_ID_NOT_EMPTY)
    private Integer coverLetterId;

}
