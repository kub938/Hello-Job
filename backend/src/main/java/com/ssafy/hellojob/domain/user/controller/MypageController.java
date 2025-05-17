package com.ssafy.hellojob.domain.user.controller;

import com.ssafy.hellojob.domain.companyanalysis.dto.response.CompanyAnalysisListResponseDto;
import com.ssafy.hellojob.domain.companyanalysis.service.CompanyAnalysisService;
import com.ssafy.hellojob.domain.coverletter.dto.response.MyPageCoverLetterDto;
import com.ssafy.hellojob.domain.coverletter.service.CoverLetterService;
import com.ssafy.hellojob.domain.coverlettercontent.dto.response.WholeCoverLetterContentDto;
import com.ssafy.hellojob.domain.exprience.dto.response.ExperiencesResponseDto;
import com.ssafy.hellojob.domain.exprience.service.ExperienceService;
import com.ssafy.hellojob.domain.jobroleanalysis.dto.response.JobRoleAnalysisSearchListResponseDto;
import com.ssafy.hellojob.domain.jobroleanalysis.service.JobRoleAnalysisService;
import com.ssafy.hellojob.domain.project.dto.response.ProjectsResponseDto;
import com.ssafy.hellojob.domain.project.service.ProjectService;
import com.ssafy.hellojob.global.auth.token.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/mypage")
public class MypageController {

    private final CompanyAnalysisService companyAnalysisService;
    private final JobRoleAnalysisService jobRoleAnalysisService;
    private final CoverLetterService coverLetterService;
    private final ExperienceService experienceService;
    private final ProjectService projectService;

    @GetMapping("/job-role-analysis")
    public List<JobRoleAnalysisSearchListResponseDto> jobRoleAnalysisListSearchByUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {

        return jobRoleAnalysisService.searchJobRoleAnalysisByUserId(userPrincipal.getUserId());
    }

    @GetMapping("/company-analysis")
    public List<CompanyAnalysisListResponseDto> companyAnalysisListSearchByUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {

        return companyAnalysisService.searchCompanyAnalysisByUserId(userPrincipal.getUserId());
    }

    @GetMapping("/cover-letter")
    public ResponseEntity<?> getCoverLetterForMyPage(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 10, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Integer userId = principal.getUserId();
        Page<MyPageCoverLetterDto> page = coverLetterService.getCoverLettersForMaPage(userId, pageable);

        return page.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(page);
    }

    // 마이페이지 경험 목록 Pageable
    @GetMapping("/experience")
    public ResponseEntity<?> getExperiencesPage(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 10, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Integer userId = principal.getUserId();

        Page<ExperiencesResponseDto> experiences = experienceService.getExperiencesPage(userId, pageable);

        return experiences.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(experiences);
    }

    // 마이페이지 프로젝트 목록 Pageable
    @GetMapping("/project")
    public ResponseEntity<?> getProjectsPage(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 10, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Integer userId = principal.getUserId();
        Page<ProjectsResponseDto> list = projectService.getProjectsPage(userId, pageable);
        return list.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(list);
    }

    @GetMapping("/cover-letter/{coverLetterId}")
    public WholeCoverLetterContentDto getWholeCoverLetterDetail(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer coverLetterId
    ) {
        Integer userId = principal.getUserId();
        return coverLetterService.getWholeContentDetail(userId, coverLetterId);
    }
}
