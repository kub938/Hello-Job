package com.ssafy.hellojob.domain.coverletter.service;

import com.ssafy.hellojob.domain.companyanalysis.entity.CompanyAnalysis;
import com.ssafy.hellojob.domain.companyanalysis.repository.CompanyAnalysisRepository;
import com.ssafy.hellojob.domain.coverletter.dto.request.CoverLetterRequestDto;
import com.ssafy.hellojob.domain.coverletter.dto.response.CoverLetterCreateResponseDto;
import com.ssafy.hellojob.domain.coverletter.entity.CoverLetter;
import com.ssafy.hellojob.domain.coverletter.entity.JobRoleSnapshot;
import com.ssafy.hellojob.domain.coverletter.repository.CoverLetterRepository;
import com.ssafy.hellojob.domain.jobroleanalysis.entity.JobRoleAnalysis;
import com.ssafy.hellojob.domain.jobroleanalysis.repository.JobRoleAnalysisRepository;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
