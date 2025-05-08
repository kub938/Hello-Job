package com.ssafy.hellojob.domain.exprience.service;

import com.ssafy.hellojob.domain.exprience.entity.Experience;
import com.ssafy.hellojob.domain.exprience.repository.ExperienceRepository;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExperienceReadService {

    private final ExperienceRepository experienceRepository;

    public Experience findExperienceByIdOrElseThrow(Integer experienceId) {
        return experienceRepository.findByExperienceId(experienceId)
                .orElseThrow(() -> new BaseException(ErrorCode.EXPERIENCE_NOT_FOUND));
    }

    public void checkExperienceValidation(Integer userId, Experience experience) {
        if(!userId.equals(experience.getUser().getUserId())) {
            throw new BaseException(ErrorCode.EXPERIENCE_MISMATCH);
        }
    }
}
