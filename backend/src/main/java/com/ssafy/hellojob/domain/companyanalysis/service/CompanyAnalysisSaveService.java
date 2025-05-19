package com.ssafy.hellojob.domain.companyanalysis.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.hellojob.domain.company.entity.Company;
import com.ssafy.hellojob.domain.company.repository.CompanyRepository;
import com.ssafy.hellojob.domain.companyanalysis.dto.request.CompanyAnalysisRequestDto;
import com.ssafy.hellojob.domain.companyanalysis.dto.response.CompanyAnalysisFastApiResponseDto;
import com.ssafy.hellojob.domain.companyanalysis.dto.response.CompanyAnalysisSseResponseDto;
import com.ssafy.hellojob.domain.companyanalysis.entity.CompanyAnalysis;
import com.ssafy.hellojob.domain.companyanalysis.entity.DartAnalysis;
import com.ssafy.hellojob.domain.companyanalysis.entity.NewsAnalysis;
import com.ssafy.hellojob.domain.companyanalysis.entity.SwotAnalysis;
import com.ssafy.hellojob.domain.companyanalysis.repository.CompanyAnalysisRepository;
import com.ssafy.hellojob.domain.companyanalysis.repository.DartAnalysisRepository;
import com.ssafy.hellojob.domain.companyanalysis.repository.NewsAnalysisRepository;
import com.ssafy.hellojob.domain.companyanalysis.repository.SwotAnalysisRepository;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyAnalysisSaveService {

    private final DartAnalysisRepository dartAnalysisRepository;
    private final NewsAnalysisRepository newsAnalysisRepository;
    private final SwotAnalysisRepository swotAnalysisRepository;
    private final CompanyAnalysisRepository companyAnalysisRepository;
    private final CompanyRepository companyRepository;

    @Transactional
    public CompanyAnalysisSseResponseDto saveCompanyAnalysis(
            User user,
            Company company,
            CompanyAnalysisFastApiResponseDto responseDto,
            CompanyAnalysisRequestDto requestDto) {
        log.debug("fast API에서 응답 받음 !!!");
        log.debug("기업 분석 : {}", responseDto.getCompany_analysis());

        // dart 정보 저장
        DartAnalysis dart = null;

        dart = DartAnalysis.of(
                responseDto.getCompany_brand(),
                responseDto.getCompany_analysis(),
                responseDto.getCompany_vision(),
                responseDto.getCompany_finance(),
                requestDto.isBasic(),
                requestDto.isPlus(),
                requestDto.isFinancial()
        );

        if (!company.isDart()) {
            dart = DartAnalysis.of(
                    responseDto.getCompany_brand(),
                    "해당 기업은 dart 공시 정보를 제공하지 않는 기업입니다.",
                    responseDto.getCompany_vision(),
                    "해당 기업은 dart 공시 정보를 제공하지 않는 기업입니다.",
                    false,
                    false,
                    false
            );
        }

        dartAnalysisRepository.save(dart);

        // NewsAnalysis 저장
        String jsonUrls;
        try {
            jsonUrls = new ObjectMapper().writeValueAsString(responseDto.getNews_urls());
        } catch (JsonProcessingException e) {
            throw new BaseException(ErrorCode.SERIALIZATION_FAIL);
        }

        NewsAnalysis news = NewsAnalysis.of(
                responseDto.getNews_summary(),
                responseDto.getAnalysis_date(),
                jsonUrls
        );

        newsAnalysisRepository.save(news);

        ObjectMapper objectMapper = new ObjectMapper();

        String strengthContent = "[]";
        String strengthTag = "[]";
        String weaknessContent = "[]";
        String weaknessTag = "[]";
        String opportunityContent = "[]";
        String opportunityTag = "[]";
        String threatContent = "[]";
        String threatTag = "[]";

        try {
            strengthContent = objectMapper.writeValueAsString(
                    responseDto.getSwot() != null && responseDto.getSwot().getStrengths() != null && responseDto.getSwot().getStrengths().getContents() != null
                            ? responseDto.getSwot().getStrengths().getContents()
                            : Collections.emptyList());

            strengthTag = objectMapper.writeValueAsString(
                    responseDto.getSwot() != null && responseDto.getSwot().getStrengths() != null && responseDto.getSwot().getStrengths().getTags() != null
                            ? responseDto.getSwot().getStrengths().getTags()
                            : Collections.emptyList());

            weaknessContent = objectMapper.writeValueAsString(
                    responseDto.getSwot() != null && responseDto.getSwot().getWeaknesses() != null && responseDto.getSwot().getWeaknesses().getContents() != null
                            ? responseDto.getSwot().getWeaknesses().getContents()
                            : Collections.emptyList());

            weaknessTag = objectMapper.writeValueAsString(
                    responseDto.getSwot() != null && responseDto.getSwot().getWeaknesses() != null && responseDto.getSwot().getWeaknesses().getTags() != null
                            ? responseDto.getSwot().getWeaknesses().getTags()
                            : Collections.emptyList());

            opportunityContent = objectMapper.writeValueAsString(
                    responseDto.getSwot() != null && responseDto.getSwot().getOpportunities() != null && responseDto.getSwot().getOpportunities().getContents() != null
                            ? responseDto.getSwot().getOpportunities().getContents()
                            : Collections.emptyList());

            opportunityTag = objectMapper.writeValueAsString(
                    responseDto.getSwot() != null && responseDto.getSwot().getOpportunities() != null && responseDto.getSwot().getOpportunities().getTags() != null
                            ? responseDto.getSwot().getOpportunities().getTags()
                            : Collections.emptyList());

            threatContent = objectMapper.writeValueAsString(
                    responseDto.getSwot() != null && responseDto.getSwot().getThreats() != null && responseDto.getSwot().getThreats().getContents() != null
                            ? responseDto.getSwot().getThreats().getContents()
                            : Collections.emptyList());

            threatTag = objectMapper.writeValueAsString(
                    responseDto.getSwot() != null && responseDto.getSwot().getThreats() != null && responseDto.getSwot().getThreats().getTags() != null
                            ? responseDto.getSwot().getThreats().getTags()
                            : Collections.emptyList());

        } catch (JsonProcessingException e) {
            throw new BaseException(ErrorCode.SERIALIZATION_FAIL);
        }


        String swotSummary = (responseDto.getSwot() != null && responseDto.getSwot().getSwot_summary() != null)
                ? responseDto.getSwot().getSwot_summary()
                : "[]";

        SwotAnalysis swotAnalysis = SwotAnalysis.of(strengthContent, strengthTag, weaknessContent, weaknessTag, opportunityContent, opportunityTag, threatContent, threatTag, swotSummary);
        swotAnalysisRepository.save(swotAnalysis);

        // CompanyAnalysis 저장
        CompanyAnalysis companyAnalysis = CompanyAnalysis.of(requestDto.getCompanyAnalysisTitle(), user, company, dart, news, swotAnalysis, requestDto.isPublic(), requestDto.getUserPrompt());
        companyAnalysisRepository.save(companyAnalysis);

        // 기업 테이블 업데이트
        company.setUpdatedAt(LocalDateTime.now());
        companyRepository.save(company);

        return CompanyAnalysisSseResponseDto.builder()
                .companyAnalysisId(companyAnalysis.getCompanyAnalysisId())
                .companyId(companyAnalysis.getCompany().getCompanyId())
                .build();
    }
}
