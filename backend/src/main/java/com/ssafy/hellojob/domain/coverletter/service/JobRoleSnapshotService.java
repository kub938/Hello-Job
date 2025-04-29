package com.ssafy.hellojob.domain.coverletter.service;

import com.ssafy.hellojob.domain.coverletter.entity.JobRoleSnapshot;
import com.ssafy.hellojob.domain.coverletter.repository.JobRoleSnapshotRepository;
import com.ssafy.hellojob.domain.jobroleanalysis.entity.JobRoleAnalysis;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobRoleSnapshotService {

    private final JobRoleSnapshotRepository jobRoleSnapshotRepository;

    public JobRoleSnapshot copyJobRoleAnalysis(String companyName, JobRoleAnalysis jobRoleAnalysis) {

        JobRoleSnapshot jobRoleSnapshot = JobRoleSnapshot.builder()
                .companyName(companyName)
                .jobRoleSnapshotName(jobRoleAnalysis.getJobRoleName())
                .jobRoleSnapshotTitle(jobRoleAnalysis.getJobRoleTitle())
                .jobRoleSnapshotSkills(jobRoleAnalysis.getJobRoleSkills())
                .jobRoleSnapshotCategory(jobRoleAnalysis.getJobRoleCategory().toString())
                .jobRoleSnapshotPreferences(jobRoleAnalysis.getJobRolePreferences())
                .jobRoleSnapshotRequirements(jobRoleAnalysis.getJobRoleRequirements())
                .jobRoleSnapshotEtc(jobRoleAnalysis.getJobRoleEtc())
                .jobRoleSnapshotWork(jobRoleAnalysis.getJobRoleWork())
                .build();

        jobRoleSnapshotRepository.save(jobRoleSnapshot);

        return jobRoleSnapshot;
    }
}
