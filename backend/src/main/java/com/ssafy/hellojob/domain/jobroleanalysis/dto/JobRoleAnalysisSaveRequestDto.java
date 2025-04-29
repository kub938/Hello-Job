package com.ssafy.hellojob.domain.jobroleanalysis.dto;

import com.ssafy.hellojob.domain.jobroleanalysis.entity.JobRoleCategory;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class JobRoleAnalysisSaveRequestDto {

    private Long companyId;

    private String jobRoleName;

    private String jobRoleTitle;

    private String jobRoleSkills;

    private String jobRoleWork;

    private String jobRoleRequirements;

    private String jobRolePreferences;

    private String jobRoleEtc;

    private JobRoleCategory jobRoleCategory;

    private Boolean isPublic;
}
