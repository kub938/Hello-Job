package com.ssafy.hellojob.domain.coverletter.dto.response;

import com.ssafy.hellojob.domain.coverletter.entity.CoverLetterContentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ContentQuestionStatusDto {
    private Integer contentNumber;
    private CoverLetterContentStatus contentStatus;
}
