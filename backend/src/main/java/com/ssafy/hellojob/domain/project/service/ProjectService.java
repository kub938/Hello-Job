package com.ssafy.hellojob.domain.project.service;

import com.ssafy.hellojob.domain.project.dto.request.ProjectRequestDto;
import com.ssafy.hellojob.domain.project.dto.response.ProjectCreateResponseDto;
import com.ssafy.hellojob.domain.project.dto.response.ProjectResponseDto;
import com.ssafy.hellojob.domain.project.dto.response.ProjectsResponseDto;
import com.ssafy.hellojob.domain.project.entity.Project;
import com.ssafy.hellojob.domain.project.repository.ProjectRepository;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.domain.user.service.UserReadService;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserReadService userReadService;
    private final ProjectReadService projectReadService;

    public ProjectCreateResponseDto createProject(Integer userId, ProjectRequestDto projectRequestDto) {
        User user = userReadService.findUserByIdOrElseThrow(userId);

        if (projectRequestDto.getProjectStartDate().isAfter(projectRequestDto.getProjectEndDate())) {
            log.debug("🌞 경험 시작 날짜: " + projectRequestDto.getProjectStartDate() + " 경험 종료 날짜: " + projectRequestDto.getProjectEndDate());
            throw new BaseException(ErrorCode.EXPERIENCE_DATE_NOT_VALID);
        }

        Project newProject = Project.builder()
                .user(user)
                .projectName(projectRequestDto.getProjectName())
                .projectIntro(projectRequestDto.getProjectIntro())
                .projectRole(projectRequestDto.getProjectRole())
                .projectSkills(projectRequestDto.getProjectSkills())
                .projectDetail(projectRequestDto.getProjectDetail())
                .projectClient(projectRequestDto.getProjectClient())
                .projectStartDate(projectRequestDto.getProjectStartDate())
                .projectEndDate(projectRequestDto.getProjectEndDate())
                .build();

        projectRepository.save(newProject);

        return ProjectCreateResponseDto.builder()
                .projectId(newProject.getProjectId())
                .build();
    }

    public List<ProjectsResponseDto> getProjects(Integer userId) {
        userReadService.findUserByIdOrElseThrow(userId);
        return projectRepository.findByUserId(userId);
    }

    public Page<ProjectsResponseDto> getProjectsPage(Integer userId, Pageable pageable) {
        userReadService.findUserByIdOrElseThrow(userId);
        return projectRepository.findPageByUserId(userId, pageable);
    }

    public ProjectResponseDto getProject(Integer userId, Integer projectId) {
        userReadService.findUserByIdOrElseThrow(userId);
        Project project = projectReadService.findProjectByIdOrElseThrow(projectId);
        projectReadService.checkProjectValidation(userId, project);

        return ProjectResponseDto.builder()
                .projectId(project.getProjectId())
                .projectName(project.getProjectName())
                .projectIntro(project.getProjectIntro())
                .projectRole(project.getProjectRole())
                .projectSkills(project.getProjectSkills())
                .projectDetail(project.getProjectDetail())
                .projectClient(project.getProjectClient())
                .projectStartDate(project.getProjectStartDate())
                .projectEndDate(project.getProjectEndDate())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    public void updateProject(Integer userId, Integer projectId, ProjectRequestDto projectRequestDto) {
        userReadService.findUserByIdOrElseThrow(userId);
        Project project = projectReadService.findProjectByIdOrElseThrow(projectId);
        projectReadService.checkProjectValidation(userId, project);

        if (projectRequestDto.getProjectStartDate().isAfter(projectRequestDto.getProjectEndDate())) {
            log.debug("🌞 경험 시작 날짜: " + projectRequestDto.getProjectStartDate() + " 경험 종료 날짜: " + projectRequestDto.getProjectEndDate());
            throw new BaseException(ErrorCode.EXPERIENCE_DATE_NOT_VALID);
        }

        project.updateProject(projectRequestDto);
    }

    public void removeProject(Integer userId, Integer projectId) {
        userReadService.findUserByIdOrElseThrow(userId);
        Project project = projectReadService.findProjectByIdOrElseThrow(projectId);
        projectReadService.checkProjectValidation(userId, project);

        projectRepository.deleteById(projectId);
    }
}
