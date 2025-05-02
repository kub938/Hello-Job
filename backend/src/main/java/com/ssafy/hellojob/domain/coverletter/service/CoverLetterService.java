package com.ssafy.hellojob.domain.coverletter.service;

import com.ssafy.hellojob.domain.companyanalysis.entity.CompanyAnalysis;
import com.ssafy.hellojob.domain.companyanalysis.repository.CompanyAnalysisRepository;
import com.ssafy.hellojob.domain.coverletter.dto.request.CoverLetterRequestDto;
import com.ssafy.hellojob.domain.coverletter.dto.request.CoverLetterUpdateRequestDto;
import com.ssafy.hellojob.domain.coverletter.dto.response.*;
import com.ssafy.hellojob.domain.coverletter.entity.CoverLetter;
import com.ssafy.hellojob.domain.jobrolesnapshot.entity.JobRoleSnapshot;
import com.ssafy.hellojob.domain.coverletter.repository.CoverLetterRepository;
import com.ssafy.hellojob.domain.jobroleanalysis.entity.JobRoleAnalysis;
import com.ssafy.hellojob.domain.jobroleanalysis.repository.JobRoleAnalysisRepository;
import com.ssafy.hellojob.domain.jobrolesnapshot.service.JobRoleSnapshotService;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class CoverLetterService {

    private final CoverLetterRepository coverLetterRepository;
    private final CompanyAnalysisRepository companyAnalysisRepository;
    private final JobRoleAnalysisRepository jobRoleAnalysisRepository;
    private final JobRoleSnapshotService jobRoleSnapshotService;
    private final CoverLetterContentService coverLetterContentService;

    public CoverLetterCreateResponseDto createCoverLetter(User user, CoverLetterRequestDto requestDto) {
        CompanyAnalysis companyAnalysis = companyAnalysisRepository.findById(requestDto.getCompanyAnalysisId())
                .orElseThrow(() -> new BaseException(ErrorCode.COMPANY_ANALYSIS_NOT_FOUND));

        String companyName = companyAnalysis.getCompany().getCompanyName();

        JobRoleSnapshot jobRoleSnapshot;

        if (requestDto.getJobRoleAnalysisId() == null) {
            jobRoleSnapshot = null;
        } else {
            JobRoleAnalysis jobRoleAnalysis = jobRoleAnalysisRepository.findById(requestDto.getJobRoleAnalysisId().longValue())
                    .orElseThrow(() -> new BaseException(ErrorCode.JOB_ROLE_ANALYSIS_NOT_FOUND));

            jobRoleSnapshot = jobRoleSnapshotService.copyJobRoleAnalysis(companyName, jobRoleAnalysis);
        }

        CoverLetter newCoverLetter = CoverLetter.builder()
                .user(user)
                .companyAnalysis(companyAnalysis)
                .jobRoleSnapshot(jobRoleSnapshot)
                .build();

        coverLetterRepository.save(newCoverLetter);

        Integer newCoverLetterId = newCoverLetter.getCoverLetterId();

        coverLetterContentService.createContents(user, newCoverLetter, requestDto.getContents());

        return CoverLetterCreateResponseDto.builder()
                .coverLetterId(newCoverLetterId)
                .build();
    }

    public CoverLetterResponseDto getCoverLetterByContentNumber(User user, Integer coverLetterId, Integer contentNumber) {
        CoverLetter coverLetter = coverLetterRepository.findById(coverLetterId)
                .orElseThrow(() -> new BaseException(ErrorCode.COVER_LETTER_NOT_FOUND));

        if (!user.getUserId().equals(coverLetter.getUser().getUserId()))
            throw new BaseException(ErrorCode.COVER_LETTER_MISMATCH);

        ContentDto content = coverLetterContentService.getCoverLetterContent(coverLetterId, contentNumber);
        SummaryDto summary = getCoverLetterSummary(coverLetterId, coverLetter);

        return CoverLetterResponseDto.builder()
                .coverLetterId(coverLetterId)
                .summary(summary)
                .content(content)
                .build();
    }

    public SummaryDto getCoverLetterSummary(Integer coverLetterId, CoverLetter coverLetter) {

        List<ContentQuestionStatusDto> contentQuestionStatuses = coverLetterContentService.getCoverLetterContentQuestionStatues(coverLetterId);
        int totalContentQuestionCount = contentQuestionStatuses.size();

        SummaryDto summaryDto = SummaryDto.builder()
                .totalContentQuestionCount(totalContentQuestionCount)
                .contentQuestionStatuses(contentQuestionStatuses)
                .companyAnalysisId(coverLetter.getCompanyAnalysis().getCompanyAnalysisId().intValue())
                .jobRoleSnapshotId(coverLetter.getJobRoleSnapshot() != null ?
                        coverLetter.getJobRoleSnapshot().getJobRoleSnapshotId()
                        : null)
                .coverLetterUpdatedAt(coverLetter.getUpdatedAt())
                .build();

        return summaryDto;
    }

    public Map<String, String> updateCoverLetter(User user, Integer coverLetterId, Integer coverLetterNumber, CoverLetterUpdateRequestDto requestDto) {
        CoverLetter coverLetter = coverLetterRepository.findById(coverLetterId)
                .orElseThrow(() -> new BaseException(ErrorCode.COVER_LETTER_NOT_FOUND));

        if (!user.getUserId().equals(coverLetter.getUser().getUserId()))
            throw new BaseException(ErrorCode.COVER_LETTER_MISMATCH);

        Boolean isInProgress = coverLetterContentService.updateCoverLetterContent(coverLetterId, coverLetterNumber, requestDto);
        coverLetter.updateUpdatedAt();

        if (isInProgress)
            return Map.of("message", "자기소개서가 임시 저장되었습니다.");

        return Map.of("message", "자기소개서가 저장되었습니다.");
    }
}
