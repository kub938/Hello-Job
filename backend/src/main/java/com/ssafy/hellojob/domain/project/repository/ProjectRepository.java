package com.ssafy.hellojob.domain.project.repository;

import com.ssafy.hellojob.domain.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Integer> {
    Optional<Project> findById(Integer id);
}
