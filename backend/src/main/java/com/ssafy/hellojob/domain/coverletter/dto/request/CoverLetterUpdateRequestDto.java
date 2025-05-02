package com.ssafy.hellojob.domain.coverletter.dto.request;

import com.ssafy.hellojob.domain.coverletter.entity.CoverLetterContentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CoverLetterUpdateRequestDto {
    private String contentDetail;
    private CoverLetterContentStatus contentStatus;
}
