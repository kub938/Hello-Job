package com.ssafy.hellojob.domain.companyanalysis.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ssafy.hellojob.global.exception.ValidationMessage;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyAnalysisRequestDto {

    @Size(max = 100, message = "스케줄 제목은 100자 이하로 입력해주세요.")
//    @NotBlank(message = ValidationMessage.COMPANY_ANALYSIS_TITLE_NOT_EMPTY)
    private String companyAnalysisTitle;

    @NotNull(message = ValidationMessage.COMPANY_ID_NOT_EMPTY)
    private Integer companyId;

    @JsonProperty("isPublic")
    private boolean isPublic;
    private boolean basic;
    private boolean plus;
    private boolean financial;
    private String userPrompt;

}
