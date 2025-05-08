package com.ssafy.hellojob.domain.project.service;

import com.ssafy.hellojob.domain.project.entity.Project;
import com.ssafy.hellojob.domain.project.repository.ProjectRepository;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectReadService {

    private final ProjectRepository projectRepository;

    public Project findProjectByIdOrElseThrow(Integer projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new BaseException(ErrorCode.PROJECT_NOT_FOUND));
    }

    public void checkProjectValidation(Integer userId, Project project) {
        if(!userId.equals(project.getUser().getUserId())) {
            throw new BaseException(ErrorCode.PROJECT_MISMATCH);
        }
    }
}
