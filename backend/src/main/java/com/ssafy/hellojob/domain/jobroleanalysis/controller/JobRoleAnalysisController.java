package com.ssafy.hellojob.domain.jobroleanalysis.controller;

import com.ssafy.hellojob.domain.jobroleanalysis.dto.request.JobRoleAnalysisBookmarkSaveRequestDto;
import com.ssafy.hellojob.domain.jobroleanalysis.dto.request.JobRoleAnalysisSaveRequestDto;
import com.ssafy.hellojob.domain.jobroleanalysis.dto.request.JobRoleAnalysisSearchCondition;
import com.ssafy.hellojob.domain.jobroleanalysis.dto.request.JobRoleAnalysisUpdateRequestDto;
import com.ssafy.hellojob.domain.jobroleanalysis.dto.response.*;
import com.ssafy.hellojob.domain.jobroleanalysis.service.JobRoleAnalysisService;
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
@RequestMapping("/api/v1/job-role-analysis")
public class JobRoleAnalysisController {

    private final JobRoleAnalysisService jobRoleAnalysisService;

    // 직무 분석 등록
    @PostMapping()
    public JobRoleAnalysisSaveResponseDto jobRoleAnalysisSave(@Valid @RequestBody JobRoleAnalysisSaveRequestDto requestDto,
                                                              @AuthenticationPrincipal UserPrincipal userPrincipal){
        return jobRoleAnalysisService.createJobRoleAnalysis(userPrincipal.getUserId(), requestDto);
    }

    // 직무 분석 상세 조회
    @GetMapping("/{jobRoleAnalysisId}")
    public JobRoleAnalysisDetailResponseDto jobRoleAnalysisDetail(@PathVariable("jobRoleAnalysisId") Integer jobRoleAnalysisId,
                                                                  @AuthenticationPrincipal UserPrincipal userPrincipal){

        return jobRoleAnalysisService.searchJobRoleAnalysis(userPrincipal.getUserId(), jobRoleAnalysisId);
    }

    // 직무 분석 북마크 추가
    @PostMapping("/bookmark")
    public JobRoleAnalysisBookmarkSaveResponseDto jobRoleAnalysisBookmarkSave(@Valid @RequestBody JobRoleAnalysisBookmarkSaveRequestDto requestDto,
                                                                              @AuthenticationPrincipal UserPrincipal userPrincipal){

        return jobRoleAnalysisService.addJobRoleBookmark(userPrincipal.getUserId(), requestDto);
    }

    // 직무 분석 북마크 삭제
    @DeleteMapping("/bookmark/{jobRoleAnalysisBookmarkId}")
    public void jobRoleAnalysisBookmarkDelete (@PathVariable("jobRoleAnalysisBookmarkId") Integer jobRoleAnalysisBookmarkId,
                                               @AuthenticationPrincipal UserPrincipal userPrincipal){
        jobRoleAnalysisService.deleteJobRoleBookmark(jobRoleAnalysisBookmarkId, userPrincipal.getUserId());
    }

    // 직무 분석 북마크 목록 조회
    @GetMapping("/bookmark")
    public List<JobRoleAnalysisListResponseDto> jobRoleAnalysisBookmarkList(@RequestParam(value = "companyId", required = false) Integer companyId,
                                                                            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<JobRoleAnalysisListResponseDto> result;

        if (companyId == null) {
            result = jobRoleAnalysisService.searchJobRoleAnalysisBookmarkList(userPrincipal.getUserId());
        } else {
            result = jobRoleAnalysisService.searchJobRoleAnalysisBookmarkListWithCompanyId(userPrincipal.getUserId(), companyId);
        }

        return result;

    }

    // 직무 분석 검색(기본값: companyId, 검색 조건: 직무명, 직무 분석 제목, 직무 카테고리)
    @GetMapping("/{companyId}/search")
    public List<JobRoleAnalysisSearchListResponseDto> jobRoleAnalysisSearch(@PathVariable Integer companyId,
                                                                            @ModelAttribute JobRoleAnalysisSearchCondition condition,
                                                                            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        return jobRoleAnalysisService.searchJobRoleAnalysis(userPrincipal.getUserId(), companyId, condition);
    }

    // 직무 분석 삭제
    @DeleteMapping("/{jobRoleAnalysisId}")
    public void jobRoleAnalysisDelete(@PathVariable Integer jobRoleAnalysisId,
                                      @AuthenticationPrincipal UserPrincipal userPrincipal){
        jobRoleAnalysisService.deleteJobRoleAnalysis(userPrincipal.getUserId(), jobRoleAnalysisId);
    }

    // 직무 분석 수정
    @PutMapping()
    public JobRoleAnalysisUpdateResponseDto jobRoleAnalysisUpdate(@Valid @RequestBody JobRoleAnalysisUpdateRequestDto requestDto, @AuthenticationPrincipal UserPrincipal userPrincipal){
        return jobRoleAnalysisService.updateJobRoleAnalysis(requestDto, userPrincipal.getUserId());
    }

}
