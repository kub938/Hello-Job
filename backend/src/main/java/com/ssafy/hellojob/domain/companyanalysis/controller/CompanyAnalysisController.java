package com.ssafy.hellojob.domain.companyanalysis.controller;

import com.ssafy.hellojob.domain.company.service.CompanyService;
import com.ssafy.hellojob.domain.companyanalysis.dto.request.CompanyAnalysisBookmarkSaveRequestDto;
import com.ssafy.hellojob.domain.companyanalysis.dto.request.CompanyAnalysisRequestDto;
import com.ssafy.hellojob.domain.companyanalysis.dto.response.CompanyAnalysisBookmarkListResponseDto;
import com.ssafy.hellojob.domain.companyanalysis.dto.response.CompanyAnalysisBookmarkSaveResponseDto;
import com.ssafy.hellojob.domain.companyanalysis.dto.response.CompanyAnalysisDetailResponseDto;
import com.ssafy.hellojob.domain.companyanalysis.dto.response.CompanyAnalysisListResponseDto;
import com.ssafy.hellojob.domain.companyanalysis.service.CompanyAnalysisService;
import com.ssafy.hellojob.global.auth.token.UserPrincipal;
import com.ssafy.hellojob.global.common.client.FastApiClientService;
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

    private final FastApiClientService fastApiClientService;

    private final CompanyAnalysisService companyAnalysisService;
    private final CompanyService companyService;

    // 기업 분석 전체 목록 조회
    @GetMapping("/all-analysis")
    public List<CompanyAnalysisListResponseDto> CompanyAnalysisAll(@AuthenticationPrincipal UserPrincipal userPrincipal){

        Integer userId = userPrincipal.getUserId();
        List<CompanyAnalysisListResponseDto> result = companyAnalysisService.searchAllCompanyAnalysis(userId);

        return result;
    }

    // 기업 분석 상세 조회
    @GetMapping("/{companyAnalysisId}")
    public CompanyAnalysisDetailResponseDto CompanyAnalysisDetail(@PathVariable("companyAnalysisId") Integer companyAnalysisId,
                                                                  @AuthenticationPrincipal UserPrincipal userPrincipal){

        Integer userId = userPrincipal.getUserId();
        CompanyAnalysisDetailResponseDto result = companyAnalysisService.detailCompanyAnalysis(userId, companyAnalysisId);

        return result;
    }

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

        Integer userId = userPrincipal.getUserId();
        List<CompanyAnalysisListResponseDto> result = companyAnalysisService.searchByCompanyIdCompanyAnalysis(companyId, userId);

        return result;
    }

    // 기업 분석 북마크 추가
    @PostMapping("/bookmark")
    public CompanyAnalysisBookmarkSaveResponseDto CompanyAnalysisBookmarkSave(@Valid @RequestBody CompanyAnalysisBookmarkSaveRequestDto requestDto,
                                                                              @AuthenticationPrincipal UserPrincipal userPrincipal){

        Integer userId = userPrincipal.getUserId();

        CompanyAnalysisBookmarkSaveResponseDto responseDto = companyAnalysisService.addCompanyAnalysisBookmark(userId, requestDto);
        return responseDto;
    }

    // 기업 분석 북마크 해제
    @DeleteMapping("/bookmark/{companyAnalysisId}")
    public void CompanyAnalysisBookmarkDelete(@PathVariable("companyAnalysisId") Integer companyAnalysisId,
                                              @AuthenticationPrincipal UserPrincipal userPrincipal){

        Integer userId = userPrincipal.getUserId();
        companyAnalysisService.deleteCompanyAnalysisBookmark(companyAnalysisId, userId);
    }

    // 기업 분석 북마크 목록 조회
    @GetMapping("/bookmark")
    public List<CompanyAnalysisBookmarkListResponseDto> CompanyAnalysisBookmarkList(@RequestParam(value = "companyId", required = false) Integer companyId,
                                                                                    @AuthenticationPrincipal UserPrincipal userPrincipal){
        Integer userId = userPrincipal.getUserId();
        List<CompanyAnalysisBookmarkListResponseDto> result;

        if (companyId == null) {
            result = companyAnalysisService.searchCompanyAnalysisBookmarkList(userId);
        } else {
            result = companyAnalysisService.searchCompanyAnalysisBookmarkListWithCompanyId(userId, companyId);
        }

        return result;

    }

}
