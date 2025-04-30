package com.ssafy.hellojob.domain.user.controller;

import com.ssafy.hellojob.domain.jobroleanalysis.dto.JobRoleAnalysisSearchListResponseDto;
import com.ssafy.hellojob.domain.jobroleanalysis.service.JobRoleAnalysisService;
import com.ssafy.hellojob.global.auth.token.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/mypage")
public class MypageController {

    private final JobRoleAnalysisService jobRoleAnalysisService;

    @GetMapping("/job-role-analysis")
    public ResponseEntity<?> JobRoleAnalysisListSearchByUser(@AuthenticationPrincipal UserPrincipal userPrincipal){

        Integer userId = userPrincipal.getUserId();
        List<JobRoleAnalysisSearchListResponseDto> result = jobRoleAnalysisService.searchJobRoleAnalysisByUserId(userId);

        if (result.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(result);
    }

}
