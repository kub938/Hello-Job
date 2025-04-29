package com.ssafy.hellojob.domain.companyanalysis.service;

import com.ssafy.hellojob.domain.companyanalysis.dto.CompanyAnalysisListResponseDto;
import com.ssafy.hellojob.domain.companyanalysis.entity.CompanyAnalysis;
import com.ssafy.hellojob.domain.companyanalysis.repository.CompanyAnalysisBookmarkRepository;
import com.ssafy.hellojob.domain.companyanalysis.repository.CompanyAnalysisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyAnalysisService {

    @Autowired
    CompanyAnalysisRepository companyAnalysisRepository;

    @Autowired
    private CompanyAnalysisBookmarkRepository companyAnalysisBookmarkRepository;

    public List<CompanyAnalysisListResponseDto> searchAllCompanyAnalysis(Integer userId) {
        List<CompanyAnalysis> analysisList = companyAnalysisRepository.findAll();

        List<CompanyAnalysisListResponseDto> result = analysisList.stream()
                .map(analysis -> CompanyAnalysisListResponseDto.builder()
                        .companyAnlaysisId(analysis.getCompanyAnalysisId())
                        .companyName(analysis.getCompany().getCompanyName())
                        .createdAt(analysis.getCreatedAt())
                        .companyViewCount(analysis.getCompanyAnalysisViewCount())
                        .companyLocation(analysis.getCompany().getCompanyLocation())
                        .companySize(analysis.getCompany().getCompanySize().name())
                        .companyIndustry(analysis.getCompany().getCompanyIndustry())
                        .companyAnalysisBookmarkCount(analysis.getCompanyAnalysisBookmarkCount())
                        .bookmark(companyAnalysisBookmarkRepository.existsByUser_UserIdAndCompanyAnalysis_CompanyAnalysisId(userId, analysis.getCompanyAnalysisId()))
                        .isPublic(analysis.isPublic())
                        .build()
                )
                .toList();

        return result;
    }

}
