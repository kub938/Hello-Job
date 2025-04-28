package com.ssafy.hellojob.domain.exprience.service;

import com.ssafy.hellojob.domain.exprience.dto.request.ExperienceRequestDto;
import com.ssafy.hellojob.domain.exprience.dto.response.ExperienceCreateResponseDto;
import com.ssafy.hellojob.domain.exprience.dto.response.ExperiencesResponseDto;
import com.ssafy.hellojob.domain.exprience.entity.Experience;
import com.ssafy.hellojob.domain.exprience.repository.ExperienceRepository;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.domain.user.repository.UserRepository;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ExperienceService {

    private final ExperienceRepository experienceRepository;
    private final UserRepository userRepository;

    public ExperienceCreateResponseDto createExperience(Integer userId, ExperienceRequestDto experienceRequestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        Experience experience = Experience.builder()
                .user(user)
                .experienceName(experienceRequestDto.getExperienceName())
                .experienceDetail(experienceRequestDto.getExperienceDetail())
                .experienceClient(experienceRequestDto.getExperienceClient())
                .experienceRole(experienceRequestDto.getExperienceRole())
                .experienceStartDate(experienceRequestDto.getExperienceStartDate())
                .experienceEndDate(experienceRequestDto.getExperienceEndDate())
                .build();

        experienceRepository.save(experience);
        Integer experienceId = experience.getExperienceId();

        return ExperienceCreateResponseDto.builder()
                .experienceId(experienceId)
                .build();
    }

    public ResponseEntity<?> getExperiences(Integer userId) {
        List<ExperiencesResponseDto> experiences = experienceRepository.findExperiencesByUserId(userId);

        if (experiences.isEmpty())
            return ResponseEntity.noContent().build();

        return ResponseEntity.ok(experiences);
    }
}
