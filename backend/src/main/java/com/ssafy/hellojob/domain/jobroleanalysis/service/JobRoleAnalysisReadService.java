package com.ssafy.hellojob.domain.jobroleanalysis.service;

import com.ssafy.hellojob.domain.jobroleanalysis.entity.JobRoleAnalysis;
import com.ssafy.hellojob.domain.jobroleanalysis.entity.JobRoleAnalysisBookmark;
import com.ssafy.hellojob.domain.jobroleanalysis.repository.JobRoleAnalysisBookmarkRepository;
import com.ssafy.hellojob.domain.jobroleanalysis.repository.JobRoleAnalysisRepository;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JobRoleAnalysisReadService {

    private final JobRoleAnalysisRepository jobRoleAnalysisRepository;
    private final JobRoleAnalysisBookmarkRepository jobRoleAnalysisBookmarkRepository;

    public JobRoleAnalysis findJobRoleAnalysisById(Integer jobRoleAnalysisId){
        return jobRoleAnalysisRepository.findById(jobRoleAnalysisId)
                .orElseThrow(() -> new BaseException(ErrorCode.JOB_ROLE_ANALYSIS_NOT_FOUND));
    }

    public JobRoleAnalysisBookmark findJobRoleBookmarkAnalysisByUserAndJobRoleAnalysis(User user, JobRoleAnalysis jobRoleAnalysis){
        return jobRoleAnalysisBookmarkRepository.findByUserAndJobRoleAnalysis(user, jobRoleAnalysis)
                .orElseThrow(() -> new BaseException(ErrorCode.JOB_ROLE_ANALYSIS_BOOKMARK_NOT_FOUND));
    }

}
