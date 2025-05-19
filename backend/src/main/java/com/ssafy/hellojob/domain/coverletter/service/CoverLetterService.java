package com.ssafy.hellojob.domain.coverletter.service;

import com.ssafy.hellojob.domain.companyanalysis.entity.CompanyAnalysis;
import com.ssafy.hellojob.domain.companyanalysis.repository.CompanyAnalysisRepository;
import com.ssafy.hellojob.domain.coverletter.dto.ai.request.*;
import com.ssafy.hellojob.domain.coverletter.dto.ai.response.AICoverLetterResponseDto;
import com.ssafy.hellojob.domain.coverletter.dto.request.CoverLetterRequestDto;
import com.ssafy.hellojob.domain.coverletter.dto.response.*;
import com.ssafy.hellojob.domain.coverletter.entity.CoverLetter;
import com.ssafy.hellojob.domain.coverletter.repository.CoverLetterRepository;
import com.ssafy.hellojob.domain.coverlettercontent.dto.response.ContentQuestionStatusDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.response.CoverLetterOnlyContentDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.response.WholeCoverLetterContentDto;
import com.ssafy.hellojob.domain.coverlettercontent.entity.CoverLetterContent;
import com.ssafy.hellojob.domain.coverlettercontent.service.CoverLetterContentService;
import com.ssafy.hellojob.domain.jobroleanalysis.entity.JobRoleAnalysis;
import com.ssafy.hellojob.domain.jobroleanalysis.repository.JobRoleAnalysisRepository;
import com.ssafy.hellojob.domain.jobrolesnapshot.entity.JobRoleSnapshot;
import com.ssafy.hellojob.domain.jobrolesnapshot.service.JobRoleSnapshotService;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.domain.user.service.UserReadService;
import com.ssafy.hellojob.global.common.client.FastApiClientService;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;

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
    private final UserReadService userReadService;
    private final FastApiClientService fastApiClientService;
    private final CoverLetterReadService coverLetterReadService;
    private final CoverLetterSwotService coverLetterSwotService;

    public CoverLetterCreateResponseDto createCoverLetter(Integer userId, CoverLetterRequestDto requestDto) {
        User user = userReadService.findUserByIdOrElseThrow(userId);

        CompanyAnalysis companyAnalysis = companyAnalysisRepository.findById(requestDto.getCompanyAnalysisId())
                .orElseThrow(() -> new BaseException(ErrorCode.COMPANY_ANALYSIS_NOT_FOUND));

        String companyName = companyAnalysis.getCompany().getCompanyName();

        JobRoleSnapshot jobRoleSnapshot;

        if (requestDto.getJobRoleAnalysisId() == null) {
            jobRoleSnapshot = null;
        } else {
            JobRoleAnalysis jobRoleAnalysis = jobRoleAnalysisRepository.findById(requestDto.getJobRoleAnalysisId())
                    .orElseThrow(() -> new BaseException(ErrorCode.JOB_ROLE_ANALYSIS_NOT_FOUND));

            jobRoleSnapshot = jobRoleSnapshotService.copyJobRoleAnalysis(companyName, jobRoleAnalysis);
        }

        CoverLetter newCoverLetter = CoverLetter.builder()
                .coverLetterTitle(requestDto.getCoverLetterTitle())
                .user(user)
                .companyAnalysis(companyAnalysis)
                .jobRoleSnapshot(jobRoleSnapshot)
                .build();

        coverLetterRepository.save(newCoverLetter);
        coverLetterRepository.flush();

        Integer newCoverLetterId = newCoverLetter.getCoverLetterId();
        log.debug("🌞 coverLetterId : {}", newCoverLetterId);

        List<CoverLetterContent> contents = coverLetterContentService.createContents(user, newCoverLetter, requestDto.getContents());
        List<AICoverLetterResponseDto> aiResponse = getAIResponses(newCoverLetterId, contents);
        coverLetterContentService.appendDetail(contents, aiResponse);

        return CoverLetterCreateResponseDto.builder()
                .coverLetterId(newCoverLetterId)
                .firstContentId(contents.get(0).getContentId())
                .build();
    }

    public List<AICoverLetterResponseDto> getAIResponses(Integer coverLetterId, List<CoverLetterContent> contents) {
        List<AICoverLetterResponseDto> responseDto;

        CoverLetter coverLetter = getFullDetail(coverLetterId, contents);
        log.debug("🎈 coverLetter : {}", coverLetter.getCoverLetterId());

        AICoverLetterRequestDto requestDto = AICoverLetterRequestDto.builder()
                .companyAnalysis(CompanyAnalysisDto.from(coverLetter.getCompanyAnalysis(), coverLetterSwotService.getSWOTDto(coverLetter)))
                .jobRoleAnalysis(
                        coverLetter.getJobRoleSnapshot() != null
                                ? JobRoleAnalysisDto.from(coverLetter.getJobRoleSnapshot())
                                : null)
                .contents(coverLetter.getContents().stream()
                        .map(content -> ContentDto.builder()
                                .content_number(content.getContentNumber())
                                .content_length(content.getContentLength())
                                .content_question(content.getContentQuestion())
                                .content_prompt(content.getContentFirstPrompt())
                                .experiences(content.getExperiences().stream()
                                        .map(cle -> cle.getExperience())
                                        .filter(Objects::nonNull)
                                        .map(ExperienceDto::from)
                                        .toList()
                                )
                                .projects(content.getExperiences().stream()
                                        .map(cle -> cle.getProject())
                                        .filter(Objects::nonNull)
                                        .map(ProjectDto::from)
                                        .toList()
                                )
                                .build()
                        ).toList()
                ).build();

        responseDto = fastApiClientService.getCoverLetterContentDetail(requestDto);
        return responseDto;
    }

    public CoverLetter getFullDetail(Integer coverLetterId, List<CoverLetterContent> contents) {
        log.debug("🌞 coverLetterId : {} ", coverLetterId);
        CoverLetter coverLetter = coverLetterRepository.findFullCoverLetterDetail(coverLetterId);

        contents.forEach(c ->
                log.debug("🧩 contentId={}, expSize={}", c.getContentId(), c.getExperiences().size())
        );

        coverLetter.assignContents(contents);

        return coverLetter;
    }

    // 자기소개서 전체 문항 상태 조회
    public CoverLetterStatusesDto getCoverLetterStatuses(Integer userId, Integer coverLetterId) {

        userReadService.findUserByIdOrElseThrow(userId);
        CoverLetter coverLetter = coverLetterReadService.findCoverLetterByIdOrElseThrow(coverLetterId);
        coverLetterReadService.checkCoverLetterValidation(userId, coverLetter);

        List<ContentQuestionStatusDto> contentQuestionStatuses = coverLetterContentService.getCoverLetterContentQuestionStatues(coverLetterId);
        int totalContentQuestionCount = contentQuestionStatuses.size();

        return CoverLetterStatusesDto.builder()
                .coverLetterId(coverLetter.getCoverLetterId())
                .totalContentQuestionCount(totalContentQuestionCount)
                .contentQuestionStatuses(contentQuestionStatuses)
                .updatedAt(coverLetter.getUpdatedAt())
                .build();
    }

    // 자기소개서 요약 조회
    public CoverLetterSummaryDto getCoverLetterSummary(Integer userId, Integer coverLetterId) {

        userReadService.findUserByIdOrElseThrow(userId);
        CoverLetter coverLetter = coverLetterReadService.findCoverLetterByIdOrElseThrow(coverLetterId);
        coverLetterReadService.checkCoverLetterValidation(userId, coverLetter);

        List<Integer> contentIds = coverLetterContentService.getContentIdsByCoverLetterId(coverLetterId);

        return CoverLetterSummaryDto.builder()
                .coverLetterTitle(coverLetter.getCoverLetterTitle())
                .contentIds(contentIds)
                .companyAnalysisId(coverLetter.getCompanyAnalysis().getCompanyAnalysisId())
                .jobRoleSnapshotId(
                        coverLetter.getJobRoleSnapshot() != null
                                ? coverLetter.getJobRoleSnapshot().getJobRoleSnapshotId()
                                : null
                )
                .build();
    }

    public Map<String, String> saveAll(Integer userId, Integer coverLetterId) {

        userReadService.findUserByIdOrElseThrow(userId);
        CoverLetter coverLetter = coverLetterReadService.findCoverLetterByIdOrElseThrow(coverLetterId);
        coverLetterReadService.checkCoverLetterValidation(userId, coverLetter);

        coverLetterContentService.saveAllContents(coverLetter);
        coverLetter.updateFinish(true);

        return Map.of("message", "자기소개서가 전체 저장되었습니다.");
    }

    // 자기소개서 삭제: 관련 엔터티 cascade로 전부 삭제
    public Map<String, String> deleteCoverLetter(Integer userId, Integer coverLetterId) {

        userReadService.findUserByIdOrElseThrow(userId);
        CoverLetter coverLetter = coverLetterReadService.findCoverLetterByIdOrElseThrow(coverLetterId);
        coverLetterReadService.checkCoverLetterValidation(userId, coverLetter);

        coverLetterRepository.delete(coverLetter);
        return Map.of("message", "자기소개서가 삭제되었습니다.");
    }

    // 마이페이지 자기소개서 목록 조회
    public Page<MyPageCoverLetterDto> getCoverLettersForMaPage(Integer userId, Pageable pageable) {
        userReadService.findUserByIdOrElseThrow(userId);

        return coverLetterRepository.getCoverLettersByUser(userId, pageable);
    }

    public WholeCoverLetterContentDto getWholeContentDetail(Integer userId, Integer coverLetterId) {

        userReadService.findUserByIdOrElseThrow(userId);
        CoverLetter coverLetter = coverLetterReadService.findCoverLetterByIdOrElseThrow(coverLetterId);
        coverLetterReadService.checkCoverLetterValidation(userId, coverLetter);

        List<CoverLetterOnlyContentDto> contents = coverLetterContentService.getWholeContentDetail(coverLetterId);

        return WholeCoverLetterContentDto.builder()
                .coverLetterId(coverLetterId)
                .contents(contents)
                .finish(coverLetter.isFinish())
                .updatedAt(coverLetter.getUpdatedAt())
                .build();
    }

    // 일정 자기소개서 목록 조회
    public List<ScheduleCoverLetterDto> getCoverLetterForSchedule(Integer userId) {
        userReadService.findUserByIdOrElseThrow(userId);
        return coverLetterRepository.findCoverLetterForSchedule(userId);
    }
}
