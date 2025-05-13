package com.ssafy.hellojob.domain.companyanalysis.service;

import com.ssafy.hellojob.domain.companyanalysis.entity.CompanyAnalysis;
import com.ssafy.hellojob.domain.companyanalysis.entity.CompanyAnalysisBookmark;
import com.ssafy.hellojob.domain.companyanalysis.repository.CompanyAnalysisBookmarkRepository;
import com.ssafy.hellojob.domain.companyanalysis.repository.CompanyAnalysisRepository;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompanyAnalysisReadService {

    private final CompanyAnalysisRepository companyAnalysisRepository;
    private final CompanyAnalysisBookmarkRepository companyAnalysisBookmarkRepository;

    public CompanyAnalysis findCompanyAnalysisByIdOrElseThrow(Integer companyAnalysisId){
        return companyAnalysisRepository.findById(companyAnalysisId)
                .orElseThrow(() -> new BaseException(ErrorCode.COMPANY_ANALYSIS_NOT_FOUND));
    }

    public CompanyAnalysisBookmark findCompanyAnalysisBookmarkByUserAndCompanyAnalysis(User user, CompanyAnalysis companyAnalysis){
        return companyAnalysisBookmarkRepository.findByUserAndCompanyAnalysis(user, companyAnalysis)
                .orElseThrow(() -> new BaseException(ErrorCode.COMPANY_ANALYSIS_BOOKMARK_NOT_FOUND));
    }

}
