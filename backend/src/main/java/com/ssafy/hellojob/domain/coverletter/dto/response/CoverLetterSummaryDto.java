package com.ssafy.hellojob.domain.coverletter.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class CoverLetterSummaryDto {
    private List<Integer> contentIds;
    private Integer companyAnalysisId;
    private Integer jobRoleSnapshotId;

    @Builder
    public CoverLetterSummaryDto(List<Integer> contentIds, Integer companyAnalysisId, Integer jobRoleSnapshotId) {
        this.contentIds = contentIds;
        this.companyAnalysisId = companyAnalysisId;
        this.jobRoleSnapshotId = jobRoleSnapshotId;
    }
}
