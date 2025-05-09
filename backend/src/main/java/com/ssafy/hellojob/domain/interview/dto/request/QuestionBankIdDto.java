package com.ssafy.hellojob.domain.interview.dto.request;

import com.ssafy.hellojob.global.exception.ValidationMessage;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionBankIdDto {

    @NotNull(message = ValidationMessage.QUESTION_BANK_ID_NOT_EMPTY)
    private Integer questionBankId;

}
