package com.ssafy.hellojob.domain.project.service;

import com.ssafy.hellojob.domain.project.dto.request.ProjectRequestDto;
import com.ssafy.hellojob.domain.project.dto.response.ProjectCreateResponseDto;
import com.ssafy.hellojob.domain.project.entity.Project;
import com.ssafy.hellojob.domain.project.entity.User;
import com.ssafy.hellojob.domain.project.repository.ProjectRepository;
import com.ssafy.hellojob.domain.project.repository.UserRepository;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
