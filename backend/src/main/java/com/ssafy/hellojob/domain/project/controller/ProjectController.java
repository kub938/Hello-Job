package com.ssafy.hellojob.domain.project.controller;

import com.ssafy.hellojob.domain.project.dto.request.ProjectRequestDto;
import com.ssafy.hellojob.domain.project.dto.response.ProjectCreateResponseDto;
import com.ssafy.hellojob.domain.project.service.ProjectService;
import com.ssafy.hellojob.global.auth.token.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/project")
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectCreateResponseDto createProject(
            @AuthenticationPrincipal UserPrincipal principal, @RequestBody ProjectRequestDto projectRequestDto) {
        Integer userId = principal.getUser().getUserId();
        log.debug("🌞 프로젝트 입력 userId: " + userId);
        ProjectCreateResponseDto responseDto = projectService.createProject(userId, projectRequestDto);
        return responseDto;
    }

    @GetMapping
    public ResponseEntity<?> getProjects(@AuthenticationPrincipal UserPrincipal principal) {
        Integer userId = principal.getUser().getUserId();
        ResponseEntity<?> response = projectService.getProjects(userId);
        return response;
    }
}
