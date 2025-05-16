package com.ssafy.hellojob.domain.companyanalysis.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.hellojob.domain.company.entity.Company;
import com.ssafy.hellojob.domain.company.service.CompanyReadService;
import com.ssafy.hellojob.domain.companyanalysis.dto.request.CompanyAnalysisBookmarkSaveRequestDto;
import com.ssafy.hellojob.domain.companyanalysis.dto.request.CompanyAnalysisFastApiRequestDto;
import com.ssafy.hellojob.domain.companyanalysis.dto.request.CompanyAnalysisRequestDto;
import com.ssafy.hellojob.domain.companyanalysis.dto.response.*;
import com.ssafy.hellojob.domain.companyanalysis.entity.*;
import com.ssafy.hellojob.domain.companyanalysis.repository.CompanyAnalysisBookmarkRepository;
import com.ssafy.hellojob.domain.companyanalysis.repository.CompanyAnalysisRepository;
import com.ssafy.hellojob.domain.companyanalysis.repository.DartAnalysisRepository;
import com.ssafy.hellojob.domain.companyanalysis.repository.NewsAnalysisRepository;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.domain.user.service.UserReadService;
import com.ssafy.hellojob.global.common.client.FastApiClientService;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyAnalysisService {

    private final CompanyAnalysisRepository companyAnalysisRepository;
    private final CompanyAnalysisBookmarkRepository companyAnalysisBookmarkRepository;
    private final DartAnalysisRepository dartAnalysisRepository;
    private final NewsAnalysisRepository newsAnalysisRepository;
    private final UserReadService userReadService;
    private final FastApiClientService fastApiClientService;
    private final CompanyReadService companyReadService;
    private final CompanyAnalysisReadService companyAnalysisReadService;

    // 토큰 확인
    public boolean tokenCheck(Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);

        if (user.getToken() <= 0) {
            throw new BaseException(ErrorCode.REQUEST_TOKEN_LIMIT_EXCEEDED);
        }

        return true;
    }

    // 기업 분석 저장
    @Transactional
    public CompanyAnalysisBookmarkSaveRequestDto createCompanyAnalysis(Integer userId, CompanyAnalysisRequestDto requestDto) {

        User user = userReadService.findUserByIdOrElseThrow(userId);

        // 유저 토큰 확인
        this.tokenCheck(userId);
        user.decreaseToken();

        // 회사 이름 가져오기
        Company company = companyReadService.findCompanyByIdOrElseThrow(requestDto.getCompanyId());

        String companyName = company.getCompanyName();

        log.debug("프론트에서 기업 분석 요청 들어옴");
        log.debug("기업명: {}", companyName);
        log.debug("기업ID: {}", requestDto.getCompanyId());
        log.debug("isPublic: {}", requestDto.isPublic());
        log.debug("isBasic: {}", requestDto.isBasic());
        log.debug("isPlus: {}", requestDto.isPlus());
        log.debug("isFinancial: {}", requestDto.isFinancial());

        // FastAPI 요청 객체 생성
        CompanyAnalysisFastApiRequestDto fastApiRequestDto = CompanyAnalysisFastApiRequestDto.builder()
                .company_name(companyName)
                .base(requestDto.isBasic())
                .plus(requestDto.isPlus())
                .fin(requestDto.isFinancial())
                .user_prompt(requestDto.getUserPrompt())
                .build();

        log.debug("fast API로 요청 보냄 !!!");

        // FastAPI 호출
        CompanyAnalysisFastApiResponseDto responseDto = fastApiClientService.sendJobAnalysisToFastApi(fastApiRequestDto);

        log.debug("fast API에서 응답 받음 !!!");
        log.debug("기업 분석 : {}", responseDto.getCompany_analysis());

        // dart 정보 저장
        DartAnalysis dart = DartAnalysis.of(
                responseDto.getCompany_brand(),
                responseDto.getCompany_analysis(),
                responseDto.getCompany_vision(),
                responseDto.getCompany_finance(),
                requestDto.isBasic(),
                requestDto.isPlus(),
                requestDto.isFinancial()
        );

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

        String strengthContent;
        String strengthTag;
        String weaknessContent;
        String weaknessTag;
        String opportunityContent;
        String opportunityTag;
        String threatContent;
        String threatTag;
        try {
            strengthContent = new ObjectMapper().writeValueAsString(responseDto.getSwot().getStrengths().getContents());
            strengthTag = new ObjectMapper().writeValueAsString(responseDto.getSwot().getStrengths().getTags());
            weaknessContent = new ObjectMapper().writeValueAsString(responseDto.getSwot().getWeaknesses().getContents());
            weaknessTag = new ObjectMapper().writeValueAsString(responseDto.getSwot().getWeaknesses().getTags());
            opportunityContent = new ObjectMapper().writeValueAsString(responseDto.getSwot().getOpportunities().getContents());
            opportunityTag = new ObjectMapper().writeValueAsString(responseDto.getSwot().getOpportunities().getTags());
            threatContent = new ObjectMapper().writeValueAsString(responseDto.getSwot().getThreats().getContents());
            threatTag = new ObjectMapper().writeValueAsString(responseDto.getSwot().getThreats().getTags());
        } catch (JsonProcessingException e) {
            throw new BaseException(ErrorCode.SERIALIZATION_FAIL);
        }

        SwotAnalysis swotAnalysis = SwotAnalysis.of(strengthContent, strengthTag, weaknessContent, weaknessTag, opportunityContent, opportunityTag, threatContent, threatTag, responseDto.getSwot().getSwot_memory());


        // CompanyAnalysis 저장
        CompanyAnalysis companyAnalysis = CompanyAnalysis.of(requestDto.getCompanyAnalysisTitle(), user, company, dart, news, swotAnalysis, requestDto.isPublic(), requestDto.getUserPrompt());
        companyAnalysisRepository.save(companyAnalysis);

        // 기업 테이블 업데이트
        company.setUpdatedAt(LocalDateTime.now());

        return CompanyAnalysisBookmarkSaveRequestDto.builder()
                .companyAnalysisId(companyAnalysis.getCompanyAnalysisId())
                .build();
    }


    // 기업 분석 목록 전체 조회
    public List<CompanyAnalysisListResponseDto> searchAllCompanyAnalysis(Integer userId) {
        List<CompanyAnalysis> analysisList = companyAnalysisRepository.findAll();

        return analysisList.stream()
                .filter(analysis ->
                        analysis.isPublic() || analysis.getUser().getUserId().equals(userId)) // 공개된 기업 분석만 조회
                .map(analysis -> {
                    DartAnalysis dart = analysis.getDartAnalysis();
                    List<String> dartCategory = new ArrayList<>();
                    if (dart != null) {
                        if (dart.isDartCompanyAnalysisBasic()) dartCategory.add("사업보고서 기본");
                        if (dart.isDartCompanyAnalysisPlus()) dartCategory.add("사업보고서 상세");
                        if (dart.isDartCompanyAnalysisFinancialData()) dartCategory.add("재무 정보");
                    }

                    return CompanyAnalysisListResponseDto.builder()
                            .companyAnalysisTitle(analysis.getCompanyAnalysisTitle())
                            .companyAnalysisId(analysis.getCompanyAnalysisId())
                            .companyName(analysis.getCompany().getCompanyName())
                            .createdAt(analysis.getCreatedAt())
                            .companyViewCount(analysis.getCompanyAnalysisViewCount())
                            .companyLocation(analysis.getCompany().getCompanyLocation())
                            .companySize(analysis.getCompany().getCompanySize().name())
                            .companyIndustry(analysis.getCompany().getCompanyIndustry())
                            .companyAnalysisBookmarkCount(analysis.getCompanyAnalysisBookmarkCount())
                            .bookmark(companyAnalysisBookmarkRepository.existsByUser_UserIdAndCompanyAnalysis_CompanyAnalysisId(
                                    userId, analysis.getCompanyAnalysisId()))
                            .isPublic(analysis.isPublic())
                            .dartCategory(dartCategory)
                            .build();
                })
                .toList();
    }

    // 해당 유저가 작성한 기업 분석 목록 조회
    public List<CompanyAnalysisListResponseDto> searchCompanyAnalysisByUserId(Integer userId) {
        List<CompanyAnalysis> analysisList = companyAnalysisRepository.findAll();

        return analysisList.stream()
                .filter(analysis -> analysis.getUser().getUserId().equals(userId))
                .map(analysis -> {
                    DartAnalysis dart = analysis.getDartAnalysis();
                    List<String> dartCategory = new ArrayList<>();
                    if (dart != null) {
                        if (dart.isDartCompanyAnalysisBasic()) dartCategory.add("사업보고서 기본");
                        if (dart.isDartCompanyAnalysisPlus()) dartCategory.add("사업보고서 상세");
                        if (dart.isDartCompanyAnalysisFinancialData()) dartCategory.add("재무 정보");
                    }

                    return CompanyAnalysisListResponseDto.builder()
                            .companyAnalysisTitle(analysis.getCompanyAnalysisTitle())
                            .companyAnalysisId(analysis.getCompanyAnalysisId())
                            .companyName(analysis.getCompany().getCompanyName())
                            .createdAt(analysis.getCreatedAt())
                            .companyViewCount(analysis.getCompanyAnalysisViewCount())
                            .companyLocation(analysis.getCompany().getCompanyLocation())
                            .companySize(analysis.getCompany().getCompanySize().name())
                            .companyIndustry(analysis.getCompany().getCompanyIndustry())
                            .companyAnalysisBookmarkCount(analysis.getCompanyAnalysisBookmarkCount())
                            .bookmark(companyAnalysisBookmarkRepository.existsByUser_UserIdAndCompanyAnalysis_CompanyAnalysisId(
                                    userId, analysis.getCompanyAnalysisId()))
                            .isPublic(analysis.isPublic())
                            .dartCategory(dartCategory)
                            .build();
                })
                .toList();
    }


    // 기업 분석 상세 조회
    @Transactional
    public CompanyAnalysisDetailResponseDto detailCompanyAnalysis(Integer userId, Integer companyAnalysisId) {

        // 유저 조회
        userReadService.findUserByIdOrElseThrow(userId);

        // 기업 분석 데이터 조회
        CompanyAnalysis companyAnalysis = companyAnalysisReadService.findCompanyAnalysisByIdOrElseThrow(companyAnalysisId);

        // 공개 여부 필터링
        if (!companyAnalysis.isPublic() && !userId.equals(companyAnalysis.getUser().getUserId())) {
            throw new BaseException(ErrorCode.INVALID_USER);
        }

        // 조회수 증가
        companyAnalysis.setCompanyAnalysisViewCount(companyAnalysis.getCompanyAnalysisViewCount() + 1);
        companyAnalysisRepository.save(companyAnalysis);

        // 즐겨찾기 여부 필터링
        boolean isBookmarked = companyAnalysisBookmarkRepository.existsByUser_UserIdAndCompanyAnalysis_CompanyAnalysisId(userId, companyAnalysisId);

        // dart 분석 시 사용된 데이터 배열로 변환
        DartAnalysis dart = companyAnalysis.getDartAnalysis();
        List<String> dartCategory = new ArrayList<>();
        if (dart.isDartCompanyAnalysisBasic()) dartCategory.add("사업보고서 기본");
        if (dart.isDartCompanyAnalysisPlus()) dartCategory.add("사업보고서 상세");
        if (dart.isDartCompanyAnalysisFinancialData()) dartCategory.add("재무 정보");

        // 해당 기업 분석에 활용된 뉴스 분석 정보 불러오기
        NewsAnalysis news = companyAnalysis.getNewsAnalysis();

        // 뉴스 크롤링 출처 기사 링크 배열로 변환
        List<String> newsUrls = new ArrayList<>();
        if (news.getNewsAnalysisUrl() != null && !news.getNewsAnalysisUrl().isBlank()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                newsUrls = objectMapper.readValue(news.getNewsAnalysisUrl(), new TypeReference<List<String>>() {
                });
            } catch (Exception e) {
                log.debug("여기?");
                throw new BaseException(ErrorCode.DESERIALIZATION_FAIL);
            }
        }

        SwotAnalysis swotAnalysis = null;
        List<String> swotStrengthContent = new ArrayList<>();
        List<String> swotStrengthTag = new ArrayList<>();
        List<String> swotWeaknessContent = new ArrayList<>();
        List<String> swotWeaknessTag = new ArrayList<>();
        List<String> swotOpportunityContent = new ArrayList<>();
        List<String> swotOpportunityTag = new ArrayList<>();
        List<String> swotThreatContent = new ArrayList<>();
        List<String> swotThreatTag = new ArrayList<>();
        String swotSummary = "";

        if (companyAnalysis.getSwotAnalysis() != null) {
            swotAnalysis = companyAnalysis.getSwotAnalysis();
            swotSummary = companyAnalysis.getSwotAnalysis().getSwotSummary();

            // swot 데이터 배열로 변환

            try {
                ObjectMapper objectMapper = new ObjectMapper();
                swotStrengthContent = objectMapper.readValue(swotAnalysis.getStrengthsContent(), new TypeReference<List<String>>() {
                });
                swotStrengthTag = objectMapper.readValue(swotAnalysis.getStrengthsTag(), new TypeReference<List<String>>() {
                });
                swotWeaknessContent = objectMapper.readValue(swotAnalysis.getWeaknessesContent(), new TypeReference<List<String>>() {
                });
                swotWeaknessTag = objectMapper.readValue(swotAnalysis.getWeaknessesTag(), new TypeReference<List<String>>() {
                });
                swotOpportunityContent = objectMapper.readValue(swotAnalysis.getOpportunitiesContent(), new TypeReference<List<String>>() {
                });
                swotOpportunityTag = objectMapper.readValue(swotAnalysis.getOpportunitiesTag(), new TypeReference<List<String>>() {
                });
                swotThreatContent = objectMapper.readValue(swotAnalysis.getThreatsContent(), new TypeReference<List<String>>() {
                });
                swotThreatTag = objectMapper.readValue(swotAnalysis.getThreatsTag(), new TypeReference<List<String>>() {
                });
            } catch (Exception e) {
                log.debug("오류메시지: {}", e);
                throw new BaseException(ErrorCode.DESERIALIZATION_FAIL);
            }

        }


        return CompanyAnalysisDetailResponseDto.builder()
                .companyAnalysisTitle(companyAnalysis.getCompanyAnalysisTitle())
                .companyAnalysisId(companyAnalysis.getCompanyAnalysisId())
                .companyName(companyAnalysis.getCompany().getCompanyName())
                .userPrompt(companyAnalysis.getUserPrompt())
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
                .dartCompanyAnalysis(dart.getDartCompanyAnalysis())
                .dartVision(dart.getDartVision())
                .dartFinancialSummery(dart.getDartFinancialSummary())
                .dartCategory(dartCategory)
                .swotStrengthContent(swotStrengthContent)
                .swotStrengthTag(swotStrengthTag)
                .swotWeaknessContent(swotWeaknessContent)
                .swotWeaknessTag(swotWeaknessTag)
                .swotOpportunityContent(swotOpportunityContent)
                .swotOpportunityTag(swotOpportunityTag)
                .swotThreatContent(swotThreatContent)
                .swotThreatTag(swotThreatTag)
                .swotSummary(swotSummary)
                .build();
    }

    // 기업 분석 검색
    public List<CompanyAnalysisListResponseDto> searchByCompanyIdCompanyAnalysis(Integer companyId, Integer userId) {

        // 유저, 회사 존재 여부 확인
        userReadService.findUserByIdOrElseThrow(userId);
        companyReadService.findCompanyByIdOrElseThrow(companyId);

        // 해당 기업의 기업 분석 전체 조회
        List<CompanyAnalysis> analysisList = companyAnalysisRepository.findTop14ByCompany_CompanyIdOrderByCreatedAtDesc(companyId);

        log.debug("기업 분석 목록 조회");
        log.debug("검색된 기업 분석 갯수: {}", analysisList.size());

        // 공개된 분석만 필터링하여 DTO 매핑
        return analysisList.stream()
                .filter(analysis ->
                        analysis.isPublic() || analysis.getUser().getUserId().equals(userId))
                .map(analysis -> {
                    DartAnalysis dart = analysis.getDartAnalysis();
                    List<String> dartCategory = new ArrayList<>();
                    if (dart != null) {
                        if (dart.isDartCompanyAnalysisBasic()) dartCategory.add("사업보고서 기본");
                        if (dart.isDartCompanyAnalysisPlus()) dartCategory.add("사업보고서 상세");
                        if (dart.isDartCompanyAnalysisFinancialData()) dartCategory.add("재무 정보");
                    }

                    return CompanyAnalysisListResponseDto.builder()
                            .companyAnalysisTitle(analysis.getCompanyAnalysisTitle())
                            .companyAnalysisId(analysis.getCompanyAnalysisId())
                            .companyName(analysis.getCompany().getCompanyName())
                            .createdAt(analysis.getCreatedAt())
                            .companyViewCount(analysis.getCompanyAnalysisViewCount())
                            .companyLocation(analysis.getCompany().getCompanyLocation())
                            .companySize(analysis.getCompany().getCompanySize().name())
                            .companyIndustry(analysis.getCompany().getCompanyIndustry())
                            .companyAnalysisBookmarkCount(analysis.getCompanyAnalysisBookmarkCount())
                            .bookmark(companyAnalysisBookmarkRepository
                                    .existsByUser_UserIdAndCompanyAnalysis_CompanyAnalysisId(userId, analysis.getCompanyAnalysisId()))
                            .isPublic(analysis.isPublic())
                            .dartCategory(dartCategory)
                            .build();
                })
                .toList();
    }


    // 기업 분석 북마크 추가
    @Transactional
    public CompanyAnalysisBookmarkSaveResponseDto addCompanyAnalysisBookmark(Integer userId, CompanyAnalysisBookmarkSaveRequestDto requestDto) {

        // 기업 분석 데이터 조회
        CompanyAnalysis companyAnalysis = companyAnalysisReadService.findCompanyAnalysisByIdOrElseThrow(requestDto.getCompanyAnalysisId());

        // 유저 조회
        User user = userReadService.findUserByIdOrElseThrow(userId);

        // 이미 북마크 되어 있는지 여부 확인
        boolean alreadyBookmarked = companyAnalysisBookmarkRepository.existsByUser_UserIdAndCompanyAnalysis_CompanyAnalysisId(userId, companyAnalysis.getCompanyAnalysisId());

        // 이미 되어 있으면 기존에 저장되어 있던 정보 반환(에러 처리x)
        if (alreadyBookmarked) {
            CompanyAnalysisBookmark existingBookmark = companyAnalysisBookmarkRepository.findByUserAndCompanyAnalysis(user, companyAnalysis)
                    .orElseThrow(() -> new BaseException(ErrorCode.COMPANY_ANALYSIS_ALREADY_BOOKMARK));
            return CompanyAnalysisBookmarkSaveResponseDto.builder()
                    .companyAnalysisBookmarkId(existingBookmark.getCompanyAnalysisBookmarkId())
                    .companyAnalysisId(companyAnalysis.getCompanyAnalysisId())
                    .build();
        }

        // 새 북마크 저장 객체 생성
        CompanyAnalysisBookmark newBookmark = CompanyAnalysisBookmark.builder()
                .user(user)
                .companyAnalysis(companyAnalysis)
                .build();

        // 북마크 정보 저장
        companyAnalysisBookmarkRepository.save(newBookmark);

        // 기업 분석 테이블 북마크 수 +1
        companyAnalysis.setCompanyAnalysisBookmarkCount(companyAnalysis.getCompanyAnalysisBookmarkCount() + 1);
        companyAnalysisRepository.save(companyAnalysis);

        return CompanyAnalysisBookmarkSaveResponseDto.builder()
                .companyAnalysisBookmarkId(newBookmark.getCompanyAnalysisBookmarkId())
                .companyAnalysisId(companyAnalysis.getCompanyAnalysisId())
                .build();
    }

    // 기업 분석 북마크 해제
    @Transactional
    public void deleteCompanyAnalysisBookmark(Integer companyAnalysisId, Integer userId) {

        // 유저 조회
        User user = userReadService.findUserByIdOrElseThrow(userId);

        CompanyAnalysis bookmarkCompanyAnalysis = companyAnalysisReadService.findCompanyAnalysisByIdOrElseThrow(companyAnalysisId);

        // 북마크 정보 조회
        CompanyAnalysisBookmark bookmark = companyAnalysisReadService.findCompanyAnalysisBookmarkByUserAndCompanyAnalysis(user, bookmarkCompanyAnalysis);

        // 기업 분석 데이터 조회
        CompanyAnalysis companyAnalysis = bookmark.getCompanyAnalysis();

        // 북마크 정보의 userId와 요청한 userId가 같을 때만 요청 처리
        if (userId.equals(bookmark.getUser().getUserId())) {
            companyAnalysisBookmarkRepository.delete(bookmark);
        } else {
            throw new BaseException(ErrorCode.INVALID_USER);
        }

        // 기업 분석 데이터 북마크 수 -1
        companyAnalysis.setCompanyAnalysisBookmarkCount(companyAnalysis.getCompanyAnalysisBookmarkCount() - 1);
        companyAnalysisRepository.save(companyAnalysis);
    }

    // 기업 분석 북마크 목록 조회(기업 상관 없이 전부)
    public List<CompanyAnalysisBookmarkListResponseDto> searchCompanyAnalysisBookmarkList(Integer userId) {

        // 유저 조회
        User user = userReadService.findUserByIdOrElseThrow(userId);

        // 유저가 북마크한 모든 북마크 리스트 조회
        List<CompanyAnalysisBookmark> bookmarkList = companyAnalysisBookmarkRepository.findAllByUser(user);

        // 기업 분석 데이터 저장할 객체 배열 생성
        List<CompanyAnalysisBookmarkListResponseDto> result = new ArrayList<>();

        // 불러온 북마크 정보 기반으로 기업 분석 데이터 불러와서 result에 저장
        for (CompanyAnalysisBookmark bookmark : bookmarkList) {
            CompanyAnalysis companyAnalysis = bookmark.getCompanyAnalysis();

            // 공개 여부 처리(비공개일경우 pass)
            if (!companyAnalysis.isPublic() && !userId.equals(companyAnalysis.getUser().getUserId())) {
                continue;
            }

            DartAnalysis dart = companyAnalysis.getDartAnalysis();
            List<String> dartCategory = new ArrayList<>();
            if (dart != null) {
                if (dart.isDartCompanyAnalysisBasic()) dartCategory.add("사업보고서 기본");
                if (dart.isDartCompanyAnalysisPlus()) dartCategory.add("사업보고서 상세");
                if (dart.isDartCompanyAnalysisFinancialData()) dartCategory.add("재무 정보");
            }

            result.add(CompanyAnalysisBookmarkListResponseDto.builder()
                    .companyAnalysisTitle(companyAnalysis.getCompanyAnalysisTitle())
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
                    .dartCategory(dartCategory)
                    .build());
        }

        return result;
    }


    // 기업 분석 북마크 목록 조회(기업별)
    public List<CompanyAnalysisBookmarkListResponseDto> searchCompanyAnalysisBookmarkListWithCompanyId(Integer userId, Integer companyId) {

        // 유저, 회사 조회
        User user = userReadService.findUserByIdOrElseThrow(userId);
        companyReadService.findCompanyByIdOrElseThrow(companyId);

        // 유저 + 기업 정보 기반 북마크 리스트 조회
        List<CompanyAnalysisBookmark> bookmarkList = companyAnalysisBookmarkRepository.findAllByUserAndCompanyAnalysis_Company_CompanyId(user, companyId);

        // 결과 반환할 객체 배열 생성
        List<CompanyAnalysisBookmarkListResponseDto> result = new ArrayList<>();

        // 불러온 북마크 정보 기반으로 기업 분석 데이터 불러와서 result에 저장
        for (CompanyAnalysisBookmark bookmark : bookmarkList) {
            CompanyAnalysis companyAnalysis = bookmark.getCompanyAnalysis();

            // 공개 여부 처리(비공개 시 pass)
            if (!companyAnalysis.isPublic() && !userId.equals(companyAnalysis.getUser().getUserId())) {
                continue;
            }

            DartAnalysis dart = companyAnalysis.getDartAnalysis();
            List<String> dartCategory = new ArrayList<>();
            if (dart != null) {
                if (dart.isDartCompanyAnalysisBasic()) dartCategory.add("사업보고서 기본");
                if (dart.isDartCompanyAnalysisPlus()) dartCategory.add("사업보고서 상세");
                if (dart.isDartCompanyAnalysisFinancialData()) dartCategory.add("재무 정보");
            }

            result.add(CompanyAnalysisBookmarkListResponseDto.builder()
                    .companyAnalysisTitle(companyAnalysis.getCompanyAnalysisTitle())
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
                    .dartCategory(dartCategory)
                    .build());
        }

        return result;
    }


}
