package com.ssafy.hellojob.domain.coverlettercontent.service;

import com.ssafy.hellojob.domain.coverletter.dto.ai.request.CompanyAnalysisDto;
import com.ssafy.hellojob.domain.coverletter.dto.ai.request.ExperienceDto;
import com.ssafy.hellojob.domain.coverletter.dto.ai.request.JobRoleAnalysisDto;
import com.ssafy.hellojob.domain.coverletter.dto.ai.request.ProjectDto;
import com.ssafy.hellojob.domain.coverletter.dto.ai.response.AICoverLetterResponseDto;
import com.ssafy.hellojob.domain.coverletter.dto.request.ContentsDto;
import com.ssafy.hellojob.domain.coverletter.repository.CoverLetterRepository;
import com.ssafy.hellojob.domain.coverlettercontent.dto.ai.request.AIChatRequestDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.ai.request.EditContentDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.request.ChatRequestDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.request.CoverLetterUpdateRequestDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.response.*;
import com.ssafy.hellojob.domain.coverletter.entity.*;
import com.ssafy.hellojob.domain.coverlettercontent.repository.CoverLetterContentRepository;
import com.ssafy.hellojob.domain.coverlettercontent.entity.CoverLetterContent;
import com.ssafy.hellojob.domain.coverlettercontent.entity.CoverLetterContentStatus;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.domain.user.service.UserReadService;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CoverLetterContentService {

    private final CoverLetterContentRepository coverLetterContentRepository;
    private final CoverLetterRepository coverLetterRepository;
    private final CoverLetterExperienceService coverLetterExperienceService;
    private final ChatLogService chatLogService;
    private final UserReadService userReadService;
    private final CoverLetterContentReadService coverLetterContentReadService;

    public List<CoverLetterContent> createContents(User user, CoverLetter coverLetter, List<ContentsDto> contentsDto) {
        List<CoverLetterContent> contents = new ArrayList<>();

        for (ContentsDto content : contentsDto) {

            CoverLetterContent newCoverLetterContent = CoverLetterContent.builder()
                    .coverLetter(coverLetter)
                    .contentStatus(CoverLetterContentStatus.PENDING)
                    .contentQuestion(content.getContentQuestion())
                    .contentNumber(content.getContentNumber())
                    .contentLength(content.getContentLength())
                    .contentFirstPrompt(content.getContentFirstPrompt())
                    .build();

            coverLetterContentRepository.save(newCoverLetterContent);
            coverLetterExperienceService.saveCoverLetterExperience(content.getContentExperienceIds(), user, newCoverLetterContent);
            coverLetterExperienceService.saveCoverLetterProject(content.getContentProjectIds(), user, newCoverLetterContent);

            contents.add(newCoverLetterContent);
        }
        return contents;
    }

    // ai 자기소개서 초안 응답 저장
    public void appendDetail(List<CoverLetterContent> contents, List<AICoverLetterResponseDto> aiResponses) {
        Map<Integer, String> aiMap = aiResponses.stream()
                .collect(Collectors.toMap(AICoverLetterResponseDto::getContent_number, AICoverLetterResponseDto::getCover_letter));

        for(CoverLetterContent content : contents) {
            String contentDetail = aiMap.get(content.getContentNumber());
            content.updateContentDetail(contentDetail);
        }
    }

    // 자기소개서 문항별 조회 응답
    @Transactional
    public CoverLetterContentDto getCoverLetterContent(Integer userId, Integer contentId) {

        userReadService.findUserByIdOrElseThrow(userId);
        CoverLetterContent coverLetterContent = coverLetterContentReadService.findCoverLetterContentByIdOrElseThrow(contentId);
        coverLetterContentReadService.checkCoverLetterContentValidation(userId, contentId);

        List<Integer> contentExperienceIds =
                coverLetterExperienceService.getCoverLetterExperienceIds(contentId);

        List<Integer> contentProjectIds =
                coverLetterExperienceService.getCoverLetterProjectIds(contentId);

        List<ChatMessageDto> contentChatLog = chatLogService.getContentChatLog(coverLetterContent.getContentId());

        CoverLetterContentDto coverLetterContentDto = CoverLetterContentDto.builder()
                .contentId(coverLetterContent.getContentId())
                .contentQuestion(coverLetterContent.getContentQuestion())
                .contentNumber(coverLetterContent.getContentNumber())
                .contentLength(coverLetterContent.getContentLength())
                .contentDetail(coverLetterContent.getContentDetail())
                .contentFirstPrompt(coverLetterContent.getContentFirstPrompt())
                .contentExperienceIds(contentExperienceIds)
                .contentProjectIds(contentProjectIds)
                .contentUpdatedAt(coverLetterContent.getUpdatedAt())
                .contentChatLog(contentChatLog)
                .build();

        return coverLetterContentDto;
    }

    public List<ContentQuestionStatusDto> getCoverLetterContentQuestionStatues(Integer coverLetterId) {
        List<ContentQuestionStatusDto> statuses = coverLetterContentRepository.getCoverLetterContentStatuses(coverLetterId);
        return statuses;
    }

    public boolean isWholeContentCompleted(List<ContentQuestionStatusDto> statuses) {
        boolean result = true;
        for (ContentQuestionStatusDto status : statuses) {
            if (status.getContentStatus() != CoverLetterContentStatus.COMPLETED) {
                result = false;
                break;
            }
        }
        return result;
    }

    public void saveAllContents(CoverLetter coverLetter) {
        List<CoverLetterContent> contents = coverLetterContentRepository.findByCoverLetter(coverLetter);
        for (CoverLetterContent content : contents) {
            content.updateContentStatus(CoverLetterContentStatus.COMPLETED);
        }
    }

    // 자기소개서 id에 해당하는 contentId 리스트 반환
    public List<Integer> getContentIdsByCoverLetterId(Integer coverLetterId) {
        List<Integer> contentIds = coverLetterContentRepository
                .findContentIdByCoverLetterId(coverLetterId);

        return contentIds;
    }

    @Transactional
    public Map<String, String> updateCoverLetterContent(Integer userId, Integer contentId, CoverLetterUpdateRequestDto requestDto) {

        userReadService.findUserByIdOrElseThrow(userId);
        CoverLetterContent content = coverLetterContentReadService.findCoverLetterContentByIdOrElseThrow(contentId);
        coverLetterContentReadService.checkCoverLetterContentValidation(userId, contentId);

        content.updateCoverLetterContent(requestDto);
        Integer coverLetterId = content.getCoverLetter().getCoverLetterId();

        List<ContentQuestionStatusDto> statuses = getCoverLetterContentQuestionStatues(coverLetterId);
        boolean isWholeContentCompleted = isWholeContentCompleted(statuses);

        // 전체 완료인 경우 자기소개서 finish 처리
        if (isWholeContentCompleted) {
            content.getCoverLetter().updateFinish(true);
        } else { // 아닌 경우 updatedAt만 반영
            content.getCoverLetter().updateFinish(false);
            coverLetterRepository.touch(coverLetterId);
        }

        if (content.getContentStatus() == CoverLetterContentStatus.IN_PROGRESS)
            return Map.of("message", "자기소개서가 임시 저장되었습니다.");

        return Map.of("message", "자기소개서가 저장되었습니다.");
    }

    public List<CoverLetterOnlyContentDto> getWholeContentDetail(Integer coverLetterId) {
        List<CoverLetterOnlyContentDto> list = coverLetterContentRepository.findContentByCoverLetterId(coverLetterId);
        return list;
    }

    public ChatResponseDto getAIChatRequestDto(Integer userId, Integer contentId, ChatRequestDto requestDto) {

        userReadService.findUserByIdOrElseThrow(userId);
        CoverLetterContent content = coverLetterContentReadService.findCoverLetterContentByIdOrElseThrow(contentId);
        coverLetterContentReadService.checkCoverLetterContentValidation(userId, contentId);

        Integer coverLetterId = coverLetterContentRepository.findCoverLetterIdByContentId(contentId)
                .orElseThrow(() -> new BaseException(ErrorCode.COVER_LETTER_NOT_FOUND));

        CoverLetter coverLetter = coverLetterRepository.findFullCoverLetterDetail(coverLetterId);

        AIChatRequestDto aiChatRequestDto = AIChatRequestDto.builder()
                .company_analysis(CompanyAnalysisDto.from(coverLetter.getCompanyAnalysis()))
                .job_role_analysis(JobRoleAnalysisDto.from(coverLetter.getJobRoleSnapshot()))
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
                .edit_content(EditContentDto.from(content, requestDto))
                .build();

        ChatResponseDto response = chatLogService.sendChat(content, aiChatRequestDto);

        return response;
    }
}
