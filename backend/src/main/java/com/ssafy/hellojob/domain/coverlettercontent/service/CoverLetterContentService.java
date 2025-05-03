package com.ssafy.hellojob.domain.coverlettercontent.service;

import com.ssafy.hellojob.domain.coverletter.dto.request.ContentsDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.request.CoverLetterUpdateRequestDto;
import com.ssafy.hellojob.domain.coverletter.dto.response.ChatMessageDto;
import com.ssafy.hellojob.domain.coverletter.service.ChatLogService;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CoverLetterContentService {

    private final CoverLetterContentRepository coverLetterContentRepository;
    private final CoverLetterExperienceService coverLetterExperienceService;
    private final ChatLogService chatLogService;

    public Integer createContents(User user, CoverLetter coverLetter, List<ContentsDto> contents) {
        for (ContentsDto content : contents) {
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
        }

        // 첫 번째 contentId
        Integer firstContentId = coverLetterContentRepository
                .findFirstContentIdByCoverLetterId(coverLetter.getCoverLetterId(), PageRequest.of(0, 1))
                .stream().findFirst().orElseThrow(() -> new BaseException(ErrorCode.COVER_LETTER_CONTENT_NOT_FOUND));

        return firstContentId;
    }

    // 자기소개서 문항별 조회 응답
    public CoverLetterContentDto getCoverLetterContent(User user, Integer contentId) {
        CoverLetterContent coverLetterContent = coverLetterContentRepository.findById(contentId)
                .orElseThrow(() -> new BaseException(ErrorCode.COVER_LETTER_CONTENT_NOT_FOUND));

        if (!user.equals(coverLetterContent.getCoverLetter().getUser()))
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

    public Boolean updateCoverLetterContent(Integer coverLetterId, Integer contentNumber, CoverLetterUpdateRequestDto requestDto) {
        CoverLetterContent content = coverLetterContentRepository.findByCoverLetterIdAndContentNumber(coverLetterId, contentNumber)
                .orElseThrow(() -> new BaseException(ErrorCode.COVER_LETTER_CONTENT_NOT_FOUND));

        content.updateCoverLetterContent(requestDto);

        if (requestDto.getContentStatus() == CoverLetterContentStatus.IN_PROGRESS) {
            return true;
        }
        return false;
    }
}
