package com.ssafy.hellojob.domain.companyanalysis.controller;

import com.ssafy.hellojob.domain.company.entity.Company;
import com.ssafy.hellojob.domain.companyanalysis.dto.*;
import com.ssafy.hellojob.domain.companyanalysis.service.CompanyAnalysisService;
import com.ssafy.hellojob.domain.jobroleanalysis.dto.JobRoleAnalysisBookmarkSaveRequestDto;
import com.ssafy.hellojob.domain.jobroleanalysis.dto.JobRoleAnalysisBookmarkSaveResponseDto;
import com.ssafy.hellojob.domain.jobroleanalysis.dto.JobRoleAnalysisListResponseDto;
import com.ssafy.hellojob.global.auth.token.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/company-analysis")
public class CompanyAnalysisController {


    private final CompanyAnalysisService companyAnalysisService;

    // 기업 분석 전체 목록 조회
    @GetMapping("/all-analysis")
    public ResponseEntity<?> CompanyAnalysisAll(@AuthenticationPrincipal UserPrincipal userPrincipal){

        Integer userId = userPrincipal.getUserId();
        List<CompanyAnalysisListResponseDto> result = companyAnalysisService.searchAllCompanyAnalysis(userId);

        if (result.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(result);
    }

    // 기업 분석 상세 조회
    @GetMapping("/{companyAnalysisId}")
    public CompanyAnalysisDetailResponseDto CompanyAnalysisDetail(@PathVariable("companyAnalysisId") Long companyAnalysisId, @AuthenticationPrincipal UserPrincipal userPrincipal){

        Integer userId = userPrincipal.getUserId();
        CompanyAnalysisDetailResponseDto result = companyAnalysisService.detailCompanyAnalysis(userId, companyAnalysisId);

        return result;
    }

    // 기업 분석 북마크 추가
    @PostMapping("/bookmark")
    public CompanyAnalysisBookmarkSaveResponseDto CompanyAnalysisBookmarkSave(@RequestBody CompanyAnalysisBookmarkSaveRequestDto requestDto, @AuthenticationPrincipal UserPrincipal userPrincipal){

        Integer userId = userPrincipal.getUserId();

        CompanyAnalysisBookmarkSaveResponseDto responseDto = companyAnalysisService.addCompanyAnalysisBookmark(userId, requestDto);
        return responseDto;
    }

    // 기업 분석 북마크 해제
    @DeleteMapping("/bookmark/{companyAnalysisBookmarkId}")
    public void CompanyAnalysisBookmarkDelete(@PathVariable("companyAnalysisBookmarkId") Long companyAnalysisBookmarkId, @AuthenticationPrincipal UserPrincipal userPrincipal){
        Integer userId = userPrincipal.getUserId();
        companyAnalysisService.deleteCompanyAnalysisBookmark(companyAnalysisBookmarkId, userId);
    }

    // 기업 분석 북마크 목록 조회
    @GetMapping("/bookmark")
    public ResponseEntity<?> CompanyAnalysisBookmarkList(@RequestParam(value = "companyId", required = false) Long companyId,
                                                                              @AuthenticationPrincipal UserPrincipal userPrincipal){
        Integer userId = userPrincipal.getUserId();
        List<CompanyAnalysisBookmarkListResponseDto> result;

        if (companyId == null) {
            result = companyAnalysisService.searchCompanyAnalysisBookmarkList(userId);
        } else {
            result = companyAnalysisService.searchCompanyAnalysisBookmarkListWithCompanyId(userId, companyId);
        }

        if (result.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204 No Content
        } else {
            return ResponseEntity.ok(result); // 200 OK
        }
    }

}
