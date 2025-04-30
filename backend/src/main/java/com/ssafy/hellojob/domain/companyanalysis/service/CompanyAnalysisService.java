package com.ssafy.hellojob.domain.companyanalysis.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.hellojob.domain.company.entity.Company;
import com.ssafy.hellojob.domain.company.repository.CompanyRepository;
import com.ssafy.hellojob.domain.companyanalysis.dto.*;
import com.ssafy.hellojob.domain.companyanalysis.entity.CompanyAnalysis;
import com.ssafy.hellojob.domain.companyanalysis.entity.CompanyAnalysisBookmark;
import com.ssafy.hellojob.domain.companyanalysis.entity.DartAnalysis;
import com.ssafy.hellojob.domain.companyanalysis.entity.NewsAnalysis;
import com.ssafy.hellojob.domain.companyanalysis.repository.CompanyAnalysisBookmarkRepository;
import com.ssafy.hellojob.domain.companyanalysis.repository.CompanyAnalysisRepository;
import com.ssafy.hellojob.domain.companyanalysis.repository.DartAnalysisRepository;
import com.ssafy.hellojob.domain.companyanalysis.repository.NewsAnalysisRepository;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.domain.user.repository.UserRepository;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyAnalysisService {

    private final CompanyRepository companyRepository;

    private final CompanyAnalysisRepository companyAnalysisRepository;

    private final CompanyAnalysisBookmarkRepository companyAnalysisBookmarkRepository;

    private final DartAnalysisRepository dartAnalysisRepository;

    private final NewsAnalysisRepository newsAnalysisRepository;

    private final UserRepository userRepository;

    // 저장 로직은 내일할거임 !!!!!
    @Transactional
    public CompanyAnalysisBookmarkSaveRequestDto createCompanyAnalysis(Integer userId, Long companyId,
                                                                       boolean basic, boolean plus, boolean financial,
                                                                       CompanyAnalysisFastApiResponseDto responseDto) {
        // 1. 유저, 회사 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new BaseException(ErrorCode.BAD_REQUEST_ERROR));

        // 2. DartAnalysis 저장
        DartAnalysis dart = DartAnalysis.of(
                responseDto.getCompanyBrand(),
                responseDto.getCompanyVision(),
                responseDto.getCompanyAnalysis(),
                basic, plus, financial
        );

        dartAnalysisRepository.save(dart);

        // 3. NewsAnalysis 저장
        String jsonUrls;
        try {
            jsonUrls = new ObjectMapper().writeValueAsString(responseDto.getNewsUrls());
        } catch (JsonProcessingException e) {
            throw new RuntimeException("뉴스 URL 직렬화 실패", e);
        }

        NewsAnalysis news = NewsAnalysis.of(
                responseDto.getNewsSummary(),
                responseDto.getAnalysisDate(),
                jsonUrls
        );


        newsAnalysisRepository.save(news);

        // 4. CompanyAnalysis 저장
        CompanyAnalysis companyAnalysis = CompanyAnalysis.of(user, company, dart, news);

        companyAnalysisRepository.save(companyAnalysis);

        return CompanyAnalysisBookmarkSaveRequestDto.builder()
                .companyAnalysisId(companyAnalysis.getCompanyAnalysisId())
                .build();
    }


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

    // 기업 분석 상세 조회
    @Transactional(readOnly = true)
    public CompanyAnalysisDetailResponseDto detailCompanyAnalysis(Integer userId, Long companyAnalysisId) {
        CompanyAnalysis companyAnalysis = companyAnalysisRepository.findById(companyAnalysisId)
                .orElseThrow(() -> new BaseException(ErrorCode.COMPANY_ANALYSIS_NOT_FOUND));

        // 공개 여부 필터링
        if (!companyAnalysis.isPublic()) {
            throw new BaseException(ErrorCode.INVALID_USER);
        }

        // 즐겨찾기 여부 필터링
        boolean isBookmarked = companyAnalysisBookmarkRepository.existsByUser_UserIdAndCompanyAnalysis_CompanyAnalysisId(userId, companyAnalysisId);

        // dart 분석 시 사용된 데이터 배열로 변환
        DartAnalysis dart = companyAnalysis.getDartAnalysis();
        List<String> dartCategory = new ArrayList<>();
        if (dart.isDartCompanyAnalysisBasic()) dartCategory.add("사업보고서 기본");
        if (dart.isDartCompanyAnalysisPlus()) dartCategory.add("사업보고서 상세");
        if (dart.isDartCompanyAnalysisFinancialData()) dartCategory.add("재무 정보");

        NewsAnalysis news = companyAnalysis.getNewsAnalysis();

        // 뉴스 크롤링 출처 기사 링크 배열로 변환
        List<String> newsUrls = new ArrayList<>();
        if (news.getNewsAnalysisUrl() != null && !news.getNewsAnalysisUrl().isBlank()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                newsUrls = objectMapper.readValue(news.getNewsAnalysisUrl(), new TypeReference<List<String>>() {});
            } catch (Exception e) {
                throw new RuntimeException("뉴스 URL 파싱 실패", e);
            }
        }

        return CompanyAnalysisDetailResponseDto.builder()
                .companyAnalysisId(companyAnalysis.getCompanyAnalysisId())
                .companyName(companyAnalysis.getCompany().getCompanyName())
                .createdAt(companyAnalysis.getCreatedAt())
                .companyViewCount(companyAnalysis.getCompanyAnalysisViewCount())
                .companyLocation(companyAnalysis.getCompany().getCompanyLocation())
                .companySize(companyAnalysis.getCompany().getCompanySize().name())
                .companyIndustry(companyAnalysis.getCompany().getCompanyIndustry())
                .companyAnalysisBookmarkCount(companyAnalysis.getCompanyAnalysisBookmarkCount())
                .bookmark(isBookmarked)
                .isPublic(companyAnalysis.isPublic())
                .newsAnalysisData(news.getNewsAnalysisData())
                .newsAnalysisDate(news.getNewsAnalysisDate())
                .newsAnalysisUrl(newsUrls) 
                .dartBrand(dart.getDartBrand())
                .dartCurrIssue(dart.getDartCurrIssue())
                .dartVision(dart.getDartVision())
                .dartFinancialSummery(dart.getDartFinancialSummary())
                .dartCategory(dartCategory)
                .build();
    }

    public List<CompanyAnalysisListResponseDto> searchByCompanyIdCompanyAnalysis(Long companyId, Integer userId) {
        List<CompanyAnalysis> analysisList = companyAnalysisRepository.findAllByCompany_CompanyId(companyId);

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

    @Transactional
    public CompanyAnalysisBookmarkSaveResponseDto addCompanyAnalysisBookmark(Integer userId, CompanyAnalysisBookmarkSaveRequestDto requestDto) {

        CompanyAnalysis companyAnalysis = companyAnalysisRepository.findById(requestDto.getCompanyAnalysisId())
                .orElseThrow(() -> new BaseException(ErrorCode.COMPANY_ANALYSIS_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        boolean alreadyBookmarked = companyAnalysisBookmarkRepository.existsByUser_UserIdAndCompanyAnalysis_CompanyAnalysisId(userId, companyAnalysis.getCompanyAnalysisId());

        if (alreadyBookmarked) {
            CompanyAnalysisBookmark existingBookmark = companyAnalysisBookmarkRepository.findByUserAndCompanyAnalysis(user, companyAnalysis)
                    .orElseThrow(() -> new BaseException(ErrorCode.COMPANY_ANALYSIS_ALREADY_BOOKMARK));
            return CompanyAnalysisBookmarkSaveResponseDto.builder()
                    .companyAnalysisBookmarkId(existingBookmark.getCompanyAnalysisBookmarkId())
                    .companyAnalysisId(companyAnalysis.getCompanyAnalysisId())
                    .build();
        }

        CompanyAnalysisBookmark newBookmark = CompanyAnalysisBookmark.builder()
                .user(user)
                .companyAnalysis(companyAnalysis)
                .build();

        companyAnalysisBookmarkRepository.save(newBookmark);

        companyAnalysis.setCompanyAnalysisBookmarkCount(companyAnalysis.getCompanyAnalysisBookmarkCount() + 1);
        companyAnalysisRepository.save(companyAnalysis);

        return CompanyAnalysisBookmarkSaveResponseDto.builder()
                .companyAnalysisBookmarkId(newBookmark.getCompanyAnalysisBookmarkId())
                .companyAnalysisId(companyAnalysis.getCompanyAnalysisId())
                .build();
    }

    @Transactional
    public void deleteCompanyAnalysisBookmark(Long companyAnalysisBookmarkId, Integer userId){
        CompanyAnalysisBookmark bookmark = companyAnalysisBookmarkRepository.findById(companyAnalysisBookmarkId)
                .orElseThrow(() -> new BaseException(ErrorCode.COMPANY_ANALYSIS_BOOKMARK_NOT_FOUND));

        CompanyAnalysis companyAnalysis = bookmark.getCompanyAnalysis();

        companyAnalysisBookmarkRepository.delete(bookmark);

        companyAnalysis.setCompanyAnalysisBookmarkCount(companyAnalysis.getCompanyAnalysisBookmarkCount() - 1);
        companyAnalysisRepository.save(companyAnalysis);
    }

    public List<CompanyAnalysisBookmarkListResponseDto> searchCompanyAnalysisBookmarkList(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        List<CompanyAnalysisBookmark> bookmarkList = companyAnalysisBookmarkRepository.findAllByUser(user);

        List<CompanyAnalysisBookmarkListResponseDto> result = new ArrayList<>();

        for (CompanyAnalysisBookmark bookmark : bookmarkList) {
            CompanyAnalysis companyAnalysis = bookmark.getCompanyAnalysis();

            if (!companyAnalysis.isPublic()) {
                continue;
            }

            result.add(CompanyAnalysisBookmarkListResponseDto.builder()
                    .companyAnalysisBookmarkId(bookmark.getCompanyAnalysisBookmarkId())
                    .companyAnalysisId(companyAnalysis.getCompanyAnalysisId())
                    .companyName(companyAnalysis.getCompany().getCompanyName())
                    .createdAt(companyAnalysis.getCreatedAt())
                    .companyViewCount(companyAnalysis.getCompanyAnalysisViewCount())
                    .companyLocation(companyAnalysis.getCompany().getCompanyLocation())
                    .companySize(companyAnalysis.getCompany().getCompanySize().name())
                    .companyIndustry(companyAnalysis.getCompany().getCompanyIndustry())
                    .companyAnalysisBookmarkCount(companyAnalysis.getCompanyAnalysisBookmarkCount())
                    .bookmark(true)
                    .isPublic(companyAnalysis.isPublic())
                    .build());
        }

        return result;
    }


    public List<CompanyAnalysisBookmarkListResponseDto> searchCompanyAnalysisBookmarkListWithCompanyId(Integer userId, Long companyId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        List<CompanyAnalysisBookmark> bookmarkList = companyAnalysisBookmarkRepository.findAllByUserAndCompanyAnalysis_Company_CompanyId(user, companyId);

        List<CompanyAnalysisBookmarkListResponseDto> result = new ArrayList<>();

        for (CompanyAnalysisBookmark bookmark : bookmarkList) {
            CompanyAnalysis companyAnalysis = bookmark.getCompanyAnalysis();

            if (!companyAnalysis.isPublic()) {
                continue;
            }

            result.add(CompanyAnalysisBookmarkListResponseDto.builder()
                    .companyAnalysisBookmarkId(bookmark.getCompanyAnalysisBookmarkId())
                    .companyAnalysisId(companyAnalysis.getCompanyAnalysisId())
                    .companyName(companyAnalysis.getCompany().getCompanyName())
                    .createdAt(companyAnalysis.getCreatedAt())
                    .companyViewCount(companyAnalysis.getCompanyAnalysisViewCount())
                    .companyLocation(companyAnalysis.getCompany().getCompanyLocation())
                    .companySize(companyAnalysis.getCompany().getCompanySize().name())
                    .companyIndustry(companyAnalysis.getCompany().getCompanyIndustry())
                    .companyAnalysisBookmarkCount(companyAnalysis.getCompanyAnalysisBookmarkCount())
                    .bookmark(true)
                    .isPublic(companyAnalysis.isPublic())
                    .build());
        }

        return result;
    }


}
