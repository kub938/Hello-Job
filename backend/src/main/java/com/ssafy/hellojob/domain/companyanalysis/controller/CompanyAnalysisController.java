package com.ssafy.hellojob.domain.companyanalysis.controller;

import com.ssafy.hellojob.domain.companyanalysis.dto.CompanyAnalysisListResponseDto;
import com.ssafy.hellojob.domain.companyanalysis.service.CompanyAnalysisService;
import com.ssafy.hellojob.global.auth.token.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/company-analysis")
public class CompanyAnalysisController {

    @Autowired
    CompanyAnalysisService companyAnalysisService;

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

}
