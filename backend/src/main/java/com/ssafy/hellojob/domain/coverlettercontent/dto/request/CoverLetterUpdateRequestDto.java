package com.ssafy.hellojob.domain.coverlettercontent.dto.request;

import com.ssafy.hellojob.domain.coverlettercontent.entity.CoverLetterContentStatus;
import com.ssafy.hellojob.global.exception.ValidationMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CoverLetterUpdateRequestDto {
    @NotBlank(message = ValidationMessage.COVER_LETTER_CONTENT_DETAIL_NOT_EMPTY)
    private String contentDetail;
    @NotNull(message = ValidationMessage.COVER_LETTER_CONTENT_STATUS_NOT_EMPTY)
    private CoverLetterContentStatus contentStatus;
}
