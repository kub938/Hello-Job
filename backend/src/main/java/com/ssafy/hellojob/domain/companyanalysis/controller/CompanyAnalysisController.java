package com.ssafy.hellojob.domain.companyanalysis.controller;

import com.ssafy.hellojob.domain.companyanalysis.dto.request.CompanyAnalysisBookmarkSaveRequestDto;
import com.ssafy.hellojob.domain.companyanalysis.dto.request.CompanyAnalysisRequestDto;
import com.ssafy.hellojob.domain.companyanalysis.dto.response.CompanyAnalysisBookmarkListResponseDto;
import com.ssafy.hellojob.domain.companyanalysis.dto.response.CompanyAnalysisBookmarkSaveResponseDto;
import com.ssafy.hellojob.domain.companyanalysis.dto.response.CompanyAnalysisDetailResponseDto;
import com.ssafy.hellojob.domain.companyanalysis.dto.response.CompanyAnalysisListResponseDto;
import com.ssafy.hellojob.domain.companyanalysis.service.CompanyAnalysisService;
import com.ssafy.hellojob.global.auth.token.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/company-analysis")
public class CompanyAnalysisController {

    private final CompanyAnalysisService companyAnalysisService;

    // 기업 분석 전체 목록 조회
    @GetMapping("/all-analysis")
    public List<CompanyAnalysisListResponseDto> CompanyAnalysisAll(@AuthenticationPrincipal UserPrincipal userPrincipal){

        Integer userId = userPrincipal.getUserId();
        return companyAnalysisService.searchAllCompanyAnalysis(userId);
    }

    // 기업 분석 상세 조회
    @GetMapping("/{companyAnalysisId}")
    public CompanyAnalysisDetailResponseDto CompanyAnalysisDetail(@PathVariable("companyAnalysisId") Integer companyAnalysisId,
                                                                  @AuthenticationPrincipal UserPrincipal userPrincipal){

        return companyAnalysisService.detailCompanyAnalysis(userPrincipal.getUserId(), companyAnalysisId);
    }

    // 기업 분석 요청(fast API)
    @PostMapping
    public CompanyAnalysisBookmarkSaveRequestDto requestCompanyAnalysis(
            @RequestBody CompanyAnalysisRequestDto requestDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        return companyAnalysisService.createCompanyAnalysis(userPrincipal.getUserId(), requestDto);
    }


    // 기업 분석 검색
    @GetMapping("/search/{companyId}")
    public List<CompanyAnalysisListResponseDto> CompanyAnalysisSearch(@PathVariable("companyId") Integer companyId,
                                                   @AuthenticationPrincipal UserPrincipal userPrincipal){
        return companyAnalysisService.searchByCompanyIdCompanyAnalysis(companyId, userPrincipal.getUserId());
    }

    // 기업 분석 북마크 추가
    @PostMapping("/bookmark")
    public CompanyAnalysisBookmarkSaveResponseDto CompanyAnalysisBookmarkSave(@Valid @RequestBody CompanyAnalysisBookmarkSaveRequestDto requestDto,
                                                                              @AuthenticationPrincipal UserPrincipal userPrincipal){

        return companyAnalysisService.addCompanyAnalysisBookmark(userPrincipal.getUserId(), requestDto);
    }

    // 기업 분석 북마크 해제
    @DeleteMapping("/bookmark/{companyAnalysisId}")
    public void CompanyAnalysisBookmarkDelete(@PathVariable("companyAnalysisId") Integer companyAnalysisId,
                                              @AuthenticationPrincipal UserPrincipal userPrincipal){
        companyAnalysisService.deleteCompanyAnalysisBookmark(companyAnalysisId, userPrincipal.getUserId());
    }

    // 기업 분석 북마크 목록 조회
    @GetMapping("/bookmark")
    public List<CompanyAnalysisBookmarkListResponseDto> CompanyAnalysisBookmarkList(@RequestParam(value = "companyId", required = false) Integer companyId,
                                                                                    @AuthenticationPrincipal UserPrincipal userPrincipal){
        List<CompanyAnalysisBookmarkListResponseDto> result;

        if (companyId == null) {
            result = companyAnalysisService.searchCompanyAnalysisBookmarkList(userPrincipal.getUserId());
        } else {
            result = companyAnalysisService.searchCompanyAnalysisBookmarkListWithCompanyId(userPrincipal.getUserId(), companyId);
        }

        return result;
    }

}
