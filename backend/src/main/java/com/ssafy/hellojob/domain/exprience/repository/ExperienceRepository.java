package com.ssafy.hellojob.domain.exprience.repository;

import com.ssafy.hellojob.domain.exprience.entity.Experience;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExperienceRepository extends JpaRepository<Experience, Integer> {

    Optional<Experience> findByExperienceId(Integer experienceId);
}
