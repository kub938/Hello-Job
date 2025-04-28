package com.ssafy.hellojob.domain.jobroleanalysis.repository;

import com.ssafy.hellojob.domain.jobroleanalysis.entity.JobRoleAnalysisBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobRoleAnalysisBookmarkRepository extends JpaRepository<JobRoleAnalysisBookmark, Long> {
}
