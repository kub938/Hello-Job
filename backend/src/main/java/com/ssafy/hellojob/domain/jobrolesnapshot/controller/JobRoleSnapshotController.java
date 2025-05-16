package com.ssafy.hellojob.domain.jobrolesnapshot.controller;

import com.ssafy.hellojob.domain.jobrolesnapshot.dto.response.JobRoleSnapshotResponseDto;
import com.ssafy.hellojob.domain.jobrolesnapshot.service.JobRoleSnapshotService;
import com.ssafy.hellojob.global.auth.token.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/job-role-snapshot")
public class JobRoleSnapshotController {

    private final JobRoleSnapshotService jobRoleSnapshotService;

    @GetMapping("/{jobRoleSnapshotId}")
    public JobRoleSnapshotResponseDto getJobRoleSnapshot(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer jobRoleSnapshotId) {
        Integer userId = principal.getUserId();
        return jobRoleSnapshotService.getJobRoleSnapshot(userId, jobRoleSnapshotId);
    }
}
