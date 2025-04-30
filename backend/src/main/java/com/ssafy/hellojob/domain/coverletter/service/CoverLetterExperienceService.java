package com.ssafy.hellojob.domain.coverletter.service;

import com.ssafy.hellojob.domain.coverletter.entity.CoverLetterContent;
import com.ssafy.hellojob.domain.coverletter.entity.CoverLetterExperience;
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
public class CoverLetterExperienceService {

    private final ExperienceRepository experienceRepository;
    private final ProjectRepository projectRepository;
    private final CoverLetterExperienceRepository coverLetterExperienceRepository;

    public void saveCoverLetterExperience(List<Integer> experienceIds, User user, CoverLetterContent content) {
        for (Integer experienceId : experienceIds) {

            Experience experience = experienceRepository.findById(experienceId)
                    .orElseThrow(() -> new BaseException(ErrorCode.EXPERIENCE_NOT_FOUND));

            if (!experience.getUser().getUserId().equals(user.getUserId()))
                throw new BaseException(ErrorCode.EXPERIENCE_MISMATCH);

            CoverLetterExperience coverLetterExperience = CoverLetterExperience.builder()
                    .coverLetterContent(content)
                    .experienceId(experienceId)
                    .build();

            coverLetterExperienceRepository.save(coverLetterExperience);
        }
    }

    public void saveCoverLetterProject(List<Integer> projectIds, User user, CoverLetterContent content) {
        for (Integer projectId : projectIds) {

            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new BaseException(ErrorCode.EXPERIENCE_NOT_FOUND));

            if (!project.getUser().getUserId().equals(user.getUserId()))
                throw new BaseException(ErrorCode.EXPERIENCE_MISMATCH);

            CoverLetterExperience coverLetterExperience = CoverLetterExperience.builder()
                    .coverLetterContent(content)
                    .projectId(projectId)
                    .build();

            coverLetterExperienceRepository.save(coverLetterExperience);
        }
    }

    public List<Integer> getCoverLetterExperienceIds(Integer coverLetterId, Integer contentNumber) {
        List<Integer> contentExperienceIds =
                coverLetterExperienceRepository.findExperiencesByCoverLetterIdAndContentNumber(coverLetterId, contentNumber);

        return contentExperienceIds;
    }

    public List<Integer> getCoverLetterProjectIds(Integer coverLetterId, Integer contentNumber) {
        List<Integer> contentProjectIds =
                coverLetterExperienceRepository.findProjectsByCoverLetterIdAndContentNumber(coverLetterId, contentNumber);
        return contentProjectIds;
    }
}
