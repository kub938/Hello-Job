package com.ssafy.hellojob.domain.coverletter.dto.ai.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AICoverLetterResponseWrapperDto {
    List<AICoverLetterResponseDto> cover_letters;
}
