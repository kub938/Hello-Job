package com.ssafy.hellojob.domain.coverletter.dto.ai.request;

import com.ssafy.hellojob.domain.jobrolesnapshot.entity.JobRoleSnapshot;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class JobRoleAnalysisDto {
    private String job_role_name;
    private String job_role_title;
    private String job_role_work;
    private String job_role_skills;
    private String job_role_requirements;
    private String job_role_preferences;
    private String job_role_etc;
    private String job_role_category;

    public static JobRoleAnalysisDto from(JobRoleSnapshot jobRoleSnapshot) {
        return JobRoleAnalysisDto.builder()
                .job_role_name(jobRoleSnapshot.getJobRoleSnapshotName())
                .job_role_category(jobRoleSnapshot.getJobRoleSnapshotCategory())
                .job_role_title(jobRoleSnapshot.getJobRoleSnapshotTitle())
                .job_role_skills(jobRoleSnapshot.getJobRoleSnapshotSkills())
                .job_role_work(jobRoleSnapshot.getJobRoleSnapshotWork())
                .job_role_requirements(jobRoleSnapshot.getJobRoleSnapshotRequirements())
                .job_role_preferences(jobRoleSnapshot.getJobRoleSnapshotPreferences())
                .job_role_etc(jobRoleSnapshot.getJobRoleSnapshotEtc())
                .build();
    }
}
