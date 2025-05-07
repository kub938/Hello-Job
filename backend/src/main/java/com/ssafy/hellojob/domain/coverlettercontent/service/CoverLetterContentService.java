package com.ssafy.hellojob.domain.coverlettercontent.service;

import com.ssafy.hellojob.domain.coverletter.dto.ai.response.AICoverLetterResponseDto;
import com.ssafy.hellojob.domain.coverletter.dto.request.ContentsDto;
import com.ssafy.hellojob.domain.coverletter.repository.CoverLetterRepository;
import com.ssafy.hellojob.domain.coverlettercontent.dto.request.CoverLetterUpdateRequestDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.response.ChatMessageDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.response.CoverLetterContentDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.response.ContentQuestionStatusDto;
import com.ssafy.hellojob.domain.coverletter.entity.*;
import com.ssafy.hellojob.domain.coverlettercontent.repository.CoverLetterContentRepository;
import com.ssafy.hellojob.domain.coverlettercontent.entity.CoverLetterContent;
import com.ssafy.hellojob.domain.coverlettercontent.entity.CoverLetterContentStatus;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CoverLetterContentService {

    private final CoverLetterContentRepository coverLetterContentRepository;
    private final CoverLetterRepository coverLetterRepository;
    private final CoverLetterExperienceService coverLetterExperienceService;
    private final ChatLogService chatLogService;

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
    public CoverLetterContentDto getCoverLetterContent(User user, Integer contentId) {
        CoverLetterContent coverLetterContent = coverLetterContentRepository.findById(contentId)
                .orElseThrow(() -> new BaseException(ErrorCode.COVER_LETTER_CONTENT_NOT_FOUND));

        if (!user.getUserId().equals(coverLetterContent.getCoverLetter().getUser().getUserId()))
            throw new BaseException(ErrorCode.COVER_LETTER_MISMATCH);

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
    public Map<String, String> updateCoverLetterContent(User user, Integer contentId, CoverLetterUpdateRequestDto requestDto) {
        CoverLetterContent content = coverLetterContentRepository.findById(contentId)
                .orElseThrow(() -> new BaseException(ErrorCode.COVER_LETTER_CONTENT_NOT_FOUND));

        if (!user.getUserId().equals(content.getCoverLetter().getUser().getUserId()))
            throw new BaseException(ErrorCode.COVER_LETTER_MISMATCH);

        if (requestDto.getContentStatus() == CoverLetterContentStatus.PENDING) {
            throw new BaseException(ErrorCode.COVER_LETTER_CONTENT_ALREADY_START);
        }

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
}
