package com.ssafy.hellojob.domain.jobroleanalysis.entity;

import com.ssafy.hellojob.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "job_role_analysis")
public class JobRoleAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "job_role_analysis_id", nullable = false)
    private Long jobRoleAnalysisId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;


    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "job_role_name", nullable = false, length = 100)
    private String jobRoleName;

    @Column(name = "job_role_title", nullable = false, length = 150)
    private String jobRoleTitle;

    @Column(name = "job_role_work")
    private String jobRoleWork;

    @Column(name = "job_role_skills")
    private String jobRoleSkills;

    @Column(name = "job_role_requirements")
    private String jobRoleRequirements;

    @Column(name = "job_role_preferences")
    private String jobRolePreferences;

    @Column(name = "job_role_etc")
    private String jobRoleEtc;

    @Column(name = "job_role_view_count", nullable = false)
    private Integer jobRoleViewCount = 0;

    @Column(name = "public", nullable = false)
    private Boolean isPublic = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;


    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_role_category")
    private JobRoleCategory jobRoleCategory;

    @Column(name = "job_role_bookmark_count", nullable = false)
    private Integer jobRoleBookmarkCount = 0;



    @Builder
    public JobRoleAnalysis(User user,
                           Long companyId,
                           String jobRoleName,
                           String jobRoleTitle,
                           String jobRoleWork,
                           String jobRoleSkills,
                           String jobRoleRequirements,
                           String jobRolePreferences,
                           String jobRoleEtc,
                           Integer jobRoleViewCount,
                           Boolean isPublic,
                           LocalDateTime createdAt,
                           LocalDateTime updatedAt,
                           JobRoleCategory jobRoleCategory,
                           Integer jobRoleBookmarkCount) {
        this.user = user;
        this.companyId = companyId;
        this.jobRoleName = jobRoleName;
        this.jobRoleTitle = jobRoleTitle;
        this.jobRoleWork = jobRoleWork;
        this.jobRoleSkills = jobRoleSkills;
        this.jobRoleRequirements = jobRoleRequirements;
        this.jobRolePreferences = jobRolePreferences;
        this.jobRoleEtc = jobRoleEtc;
        this.jobRoleViewCount = jobRoleViewCount;
        this.isPublic = isPublic;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.jobRoleCategory = jobRoleCategory;
        this.jobRoleBookmarkCount = jobRoleBookmarkCount;
    }


    public void setJobRoleBookmarkCount(Integer jobRoleBookmarkCount) {
        this.jobRoleBookmarkCount = jobRoleBookmarkCount;
    }

    public void setJobRoleViewCount(Integer jobRoleViewCount){
        this.jobRoleViewCount = jobRoleViewCount;
    }


}
