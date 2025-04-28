package com.ssafy.hellojob.domain.jobroleanalysis.service;

import com.ssafy.hellojob.domain.jobroleanalysis.dto.JobRoleAnalysisSaveRequestDto;
import com.ssafy.hellojob.domain.jobroleanalysis.dto.JobRoleAnalysisSaveResponseDto;
import com.ssafy.hellojob.domain.jobroleanalysis.entity.JobRoleAnalysis;
import com.ssafy.hellojob.domain.jobroleanalysis.repository.JobRoleAnalysisRepository;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.domain.user.repository.UserRepository;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class JobRoleAnalysisService {

    @Autowired
    JobRoleAnalysisRepository jobRoleAnalysisRepository;

    @Autowired
    UserRepository userRepository;

    public JobRoleAnalysisSaveResponseDto createJobRoleAnalysis(Integer userId, JobRoleAnalysisSaveRequestDto requestDto){

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        JobRoleAnalysis newJobRoleAnalysis = JobRoleAnalysis.builder()
                .user(user)
                .companyId(requestDto.getCompanyId())
                .jobRoleName(requestDto.getJobRoleName())
                .jobRoleTitle(requestDto.getJobRoleTitle())
                .jobRoleSkills(requestDto.getJobRoleSkills())
                .jobRoleWork(requestDto.getJobRoleWork())
                .jobRoleRequirements(requestDto.getJobRoleRequirements())
                .jobRolePreferences(requestDto.getJobRolePreferences())
                .jobRoleEtc(requestDto.getJobRoleEtc())
                .jobRoleCategory(requestDto.getJobRoleCategory())
                .jobRoleViewCount(0) // 신규 생성이니까 기본값
                .jobRoleBookmarkCount(0) // 신규 생성이니까 기본값
                .isPublic(requestDto.getIsPublic()) // 공개 여부
                .build();

        jobRoleAnalysisRepository.save(newJobRoleAnalysis);

        return JobRoleAnalysisSaveResponseDto.builder()
                .id(newJobRoleAnalysis.getJobRoleAnalysisId())
                .build();
    }


}
