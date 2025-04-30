package com.ssafy.hellojob.domain.coverletter.dto.response;

import com.ssafy.hellojob.domain.coverletter.entity.CoverLetterContentStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
public class SummaryDto {
    private int totalContentQuestionCount;
    private List<ContentQuestionStatusDto> contentQuestionStatuses;
    private Integer companyAnalysisId;
    private Integer jobRoleSnapshotId;
    private LocalDateTime coverLetterUpdatedAt;

    @Builder
    public SummaryDto(int totalContentQuestionCount, List<ContentQuestionStatusDto> contentQuestionStatuses, Integer companyAnalysisId, Integer jobRoleSnapshotId, LocalDateTime coverLetterUpdatedAt) {
        this.totalContentQuestionCount = totalContentQuestionCount;
        this.contentQuestionStatuses = contentQuestionStatuses;
        this.companyAnalysisId = companyAnalysisId;
        this.jobRoleSnapshotId = jobRoleSnapshotId;
        this.coverLetterUpdatedAt = coverLetterUpdatedAt;
    }
}
