package com.ssafy.hellojob.domain.coverletter.repository;

import com.ssafy.hellojob.domain.coverletter.entity.CoverLetter;
import com.ssafy.hellojob.domain.coverletter.entity.JobRoleSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JobRoleSnapshotRepository extends JpaRepository<JobRoleSnapshot, Integer> {
}
