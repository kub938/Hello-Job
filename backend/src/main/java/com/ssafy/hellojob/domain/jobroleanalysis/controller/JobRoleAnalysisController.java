package com.ssafy.hellojob.domain.jobroleanalysis.controller;

import com.ssafy.hellojob.domain.jobroleanalysis.dto.JobRoleAnalysisBookmarkSaveRequestDto;
import com.ssafy.hellojob.domain.jobroleanalysis.dto.JobRoleAnalysisBookmarkSaveResponseDto;
import com.ssafy.hellojob.domain.jobroleanalysis.dto.JobRoleAnalysisSaveRequestDto;
import com.ssafy.hellojob.domain.jobroleanalysis.dto.JobRoleAnalysisSaveResponseDto;
import com.ssafy.hellojob.domain.jobroleanalysis.service.JobRoleAnalysisService;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.domain.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/job-role-analysis")
public class JobRoleAnalysisController {


    @Autowired
    JobRoleAnalysisService jobRoleAnalysisService;

    @Autowired
    UserService userService;

    @PostMapping()
    public JobRoleAnalysisSaveResponseDto jobRoleAnalysisSave(@RequestBody JobRoleAnalysisSaveRequestDto requestDto, @RequestParam("userId") Integer userId){

        JobRoleAnalysisSaveResponseDto responseDto = jobRoleAnalysisService.createJobRoleAnalysis(userId, requestDto);

        return responseDto;
    }

    @PostMapping("/bookmark")
    public JobRoleAnalysisBookmarkSaveResponseDto jobRoleAnalysisBookmarkSave(@RequestBody JobRoleAnalysisBookmarkSaveRequestDto requestDto){
        JobRoleAnalysisBookmarkSaveResponseDto responseDto = jobRoleAnalysisService.addJobRoleBookmark(userId, requestDto);
        return responseDto;
    }



}
