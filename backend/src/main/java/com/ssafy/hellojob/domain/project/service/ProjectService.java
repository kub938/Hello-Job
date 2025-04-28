package com.ssafy.hellojob.domain.project.service;

import com.ssafy.hellojob.domain.project.dto.request.ProjectRequestDto;
import com.ssafy.hellojob.domain.project.dto.response.ProjectCreateResponseDto;
import com.ssafy.hellojob.domain.project.dto.response.ProjectResponseDto;
import com.ssafy.hellojob.domain.project.dto.response.ProjectsResponseDto;
import com.ssafy.hellojob.domain.project.entity.Project;
import com.ssafy.hellojob.domain.project.repository.ProjectRepository;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.domain.user.repository.UserRepository;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectCreateResponseDto createProject(Integer userId, ProjectRequestDto projectRequestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

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

    public ResponseEntity<?> getProjects(Integer userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
        List<ProjectsResponseDto> projects = projectRepository.findByUserId(userId);

        if (projects.isEmpty()) {
            log.debug("🌞 userId: ", userId, " 해당 유저의 프로젝트가 없습니다.");
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(projects);
    }

    public ProjectResponseDto getProject(Integer userId, Integer projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BaseException(ErrorCode.PROJECT_NOT_FOUND));

        if (project.getUser().getUserId() != userId) {
            throw new BaseException(ErrorCode.PROJECT_MISMATCH);
        }

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
}
