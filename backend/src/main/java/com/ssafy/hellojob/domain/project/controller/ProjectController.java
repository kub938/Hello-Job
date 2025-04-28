package com.ssafy.hellojob.domain.project.controller;

import com.ssafy.hellojob.domain.project.dto.request.ProjectRequestDto;
import com.ssafy.hellojob.domain.project.dto.response.ProjectCreateResponseDto;
import com.ssafy.hellojob.domain.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/project")
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping("/{userId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectCreateResponseDto createProject(@PathVariable Integer userId, @RequestBody ProjectRequestDto projectRequestDto) {
        ProjectCreateResponseDto responseDto = projectService.createProject(userId, projectRequestDto);
        return responseDto;
    }
}
