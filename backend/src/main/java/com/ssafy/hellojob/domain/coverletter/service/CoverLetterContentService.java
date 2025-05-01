package com.ssafy.hellojob.domain.coverletter.service;

import com.ssafy.hellojob.domain.coverletter.dto.request.ContentsDto;
import com.ssafy.hellojob.domain.coverletter.dto.request.CoverLetterUpdateRequestDto;
import com.ssafy.hellojob.domain.coverletter.dto.response.ChatMessageDto;
import com.ssafy.hellojob.domain.coverletter.dto.response.ContentDto;
import com.ssafy.hellojob.domain.coverletter.dto.response.ContentQuestionStatusDto;
import com.ssafy.hellojob.domain.coverletter.entity.*;
import com.ssafy.hellojob.domain.coverletter.repository.ChatLogRepository;
import com.ssafy.hellojob.domain.coverletter.repository.CoverLetterContentRepository;
import com.ssafy.hellojob.domain.coverletter.repository.CoverLetterExperienceRepository;
import com.ssafy.hellojob.domain.exprience.entity.Experience;
import com.ssafy.hellojob.domain.exprience.repository.ExperienceRepository;
import com.ssafy.hellojob.domain.project.entity.Project;
import com.ssafy.hellojob.domain.project.repository.ProjectRepository;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CoverLetterContentService {

    private final CoverLetterContentRepository coverLetterContentRepository;
    private final CoverLetterExperienceService coverLetterExperienceService;
    private final ChatLogService chatLogService;

    public void createContents(User user, CoverLetter coverLetter, List<ContentsDto> contents) {
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
    }

    // 자기소개서 문항별 조회 응답
    public ContentDto getCoverLetterContent(Integer coverLetterId, Integer contentNumber) {
        log.debug("🌞 자기소개서 coverLetterId {} 문항 번호 contentNumber: {}", coverLetterId, contentNumber);

        CoverLetterContent coverLetterContent = coverLetterContentRepository.findByCoverLetterIdAndContentNumber(coverLetterId, contentNumber)
                .orElseThrow(() -> new BaseException(ErrorCode.COVER_LETTER_CONTENT_NOT_FOUND));

        log.debug("🌞 coverLetterContent Id: {}, Detail {} ", coverLetterContent.getContentId(), coverLetterContent.getContentDetail());

        List<Integer> contentExperienceIds =
                coverLetterExperienceService.getCoverLetterExperienceIds(coverLetterId, contentNumber);

        List<Integer> contentProjectIds =
                coverLetterExperienceService.getCoverLetterProjectIds(coverLetterId, contentNumber);

        List<ChatMessageDto> contentChatLog = chatLogService.getContentChatLog(coverLetterContent.getContentId());

        ContentDto contentDto = ContentDto.builder()
                .contentQuestion(coverLetterContent.getContentQuestion())
                .contentNumber(coverLetterContent.getContentNumber())
                .contentLength(coverLetterContent.getContentLength())
                .contentDetail(coverLetterContent.getContentDetail())
                .contentFirstPrompt(coverLetterContent.getContentFirstPrompt())
                .contentStatus(coverLetterContent.getContentStatus())
                .contentExperienceIds(contentExperienceIds)
                .contentProjectIds(contentProjectIds)
                .contentUpdatedAt(coverLetterContent.getUpdatedAt())
                .contentChatLog(contentChatLog)
                .build();

        return contentDto;
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
