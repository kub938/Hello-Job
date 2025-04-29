package com.ssafy.hellojob.domain.jobroleanalysis.repository;

import com.ssafy.hellojob.domain.company.entity.Company;
import com.ssafy.hellojob.domain.jobroleanalysis.entity.JobRoleAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JobRoleAnalysisRepository extends JpaRepository<JobRoleAnalysis, Long> {

    @Query("SELECT j.user.userId FROM JobRoleAnalysis j WHERE j.jobRoleAnalysisId = :jobRoleAnalysisId")
    Integer findUserIdByJobRoleAnalysisId(@Param("jobRoleAnalysisId") Long jobRoleAnalysisId);

}
