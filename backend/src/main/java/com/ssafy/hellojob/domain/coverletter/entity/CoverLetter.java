package com.ssafy.hellojob.domain.coverletter.entity;

import com.ssafy.hellojob.domain.companyanalysis.entity.CompanyAnalysis;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.global.common.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "cover_letter")
public class CoverLetter extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cover_letter_id")
    private Integer coverLetterId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "company_analysis_id", nullable = false)
    private CompanyAnalysis companyAnalysis;

    @OneToOne
    @JoinColumn(name = "job_role_analysis_snapshot")
    private JobRoleSnapshot jobRoleSnapshot;

    @Column(name = "finish", nullable = false)
    @ColumnDefault("false")
    private boolean finish = false;

    @Builder
    public CoverLetter(Integer coverLetterId, User user, CompanyAnalysis companyAnalysis, JobRoleSnapshot jobRoleSnapshot, boolean finish) {
        this.coverLetterId = coverLetterId;
        this.user = user;
        this.companyAnalysis = companyAnalysis;
        this.jobRoleSnapshot = jobRoleSnapshot;
        this.finish = finish;
    }
}
