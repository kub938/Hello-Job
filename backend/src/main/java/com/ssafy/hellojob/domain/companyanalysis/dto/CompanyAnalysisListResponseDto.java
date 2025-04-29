package com.ssafy.hellojob.domain.companyanalysis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class CompanyAnalysisListResponseDto {

    private Long companyAnlaysisId;
    private String companyName; // 기업명
    private LocalDateTime createdAt;
    private Integer companyViewCount;
    private String companyLocation; // 기업 소재지
    private String companySize; // 기업 규모
    private String companyIndustry; // 기업 업종명
    private Integer companyAnalysisBookmarkCount;
    private boolean bookmark; // 북마크 여부
    private boolean isPublic;

}
