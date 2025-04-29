package com.ssafy.hellojob.domain.coverletter.service;

import com.ssafy.hellojob.domain.coverletter.dto.request.ContentsDto;
import com.ssafy.hellojob.domain.coverletter.entity.CoverLetter;
import com.ssafy.hellojob.domain.coverletter.entity.CoverLetterContent;
import com.ssafy.hellojob.domain.coverletter.entity.CoverLetterContentStatus;
import com.ssafy.hellojob.domain.coverletter.entity.CoverLetterExperience;
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

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CoverLetterContentService {

    private final CoverLetterContentRepository coverLetterContentRepository;
    private final CoverLetterExperienceRepository coverLetterExperienceRepository;
    private final ExperienceRepository experienceRepository;
    private final ProjectRepository projectRepository;

    public void createContents(User user, CoverLetter coverLetter, List<ContentsDto> contents) {
        for (ContentsDto content : contents) {
            CoverLetterContent newCoverLetterContent = CoverLetterContent.builder()
                    .coverLetter(coverLetter)
                    .chatLog(null)
                    .coverLetterContentStatus(CoverLetterContentStatus.PENDING)
                    .contentQuestion(content.getContentQuestion())
                    .contentNumber(content.getContentNumber())
                    .contentLength(content.getContentLength())
                    .contentFirstPrompt(content.getContentFirstPrompt())
                    .build();

            coverLetterContentRepository.save(newCoverLetterContent);

            for (Integer experienceId: content.getContentExperienceIds()) {

                Experience experience = experienceRepository.findByExperienceId(experienceId)
                        .orElseThrow(() -> new BaseException(ErrorCode.EXPERIENCE_NOT_FOUND));

                if (!experience.getUser().getUserId().equals(user.getUserId()))
                    throw new BaseException(ErrorCode.EXPERIENCE_MISMATCH);

                CoverLetterExperience coverLetterExperience = CoverLetterExperience.builder()
                        .coverLetterContent(newCoverLetterContent)
                        .experienceId(experienceId)
                        .build();

                coverLetterExperienceRepository.save(coverLetterExperience);
            }

            for (Integer projectId: content.getContentProjectIds()) {
                Project project = projectRepository.findById(projectId)
                        .orElseThrow(() -> new BaseException(ErrorCode.PROJECT_NOT_FOUND));

                if (!project.getUser().getUserId().equals(user.getUserId()))
                    throw new BaseException(ErrorCode.PROJECT_MISMATCH);

                CoverLetterExperience coverLetterExperience = CoverLetterExperience.builder()
                        .coverLetterContent(newCoverLetterContent)
                        .projectId(projectId)
                        .build();

                coverLetterExperienceRepository.save(coverLetterExperience);
            }
        }
    }
}
