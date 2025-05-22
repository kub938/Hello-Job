package com.ssafy.hellojob.domain.companyanalysis.entity;

import com.ssafy.hellojob.domain.company.entity.Company;
import com.ssafy.hellojob.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "company_analysis")
public class CompanyAnalysis {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "company_analysis_id", nullable = false)
    private Integer companyAnalysisId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "company_analysis_title", nullable = false)
    private String companyAnalysisTitle;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "company_analysis_view_count", nullable = false)
    private Integer companyAnalysisViewCount;

    @Column(name = "company_analysis_bookmark_count", nullable = false)
    private Integer companyAnalysisBookmarkCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dart_analysis_id", nullable = false)
    private DartAnalysis dartAnalysis;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "news_analysis_id", nullable = false)
    private NewsAnalysis newsAnalysis;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "swot_analysis_id")
    private SwotAnalysis swotAnalysis;

    @Column(name = "public", nullable = false)
    private boolean isPublic;

    @Column(name = "company_analysis_user_prompt")
    private String userPrompt;

    public void setCompanyAnalysisBookmarkCount(Integer companyAnalysisBookmarkCount) {
        this.companyAnalysisBookmarkCount = companyAnalysisBookmarkCount;
    }

    public void setCompanyAnalysisViewCount(Integer companyAnalysisViewCount){
        this.companyAnalysisViewCount = companyAnalysisViewCount;
    }


    public static CompanyAnalysis of(String companyAnalysisTitle, User user, Company company, DartAnalysis dart, NewsAnalysis news, SwotAnalysis swotAnalysis, boolean isPublic, String userPrompt) {
        CompanyAnalysis ca = new CompanyAnalysis();
        ca.companyAnalysisTitle = companyAnalysisTitle;
        ca.user = user;
        ca.company = company;
        ca.dartAnalysis = dart;
        ca.newsAnalysis = news;
        ca.swotAnalysis = swotAnalysis;
        ca.companyAnalysisViewCount = 0;
        ca.companyAnalysisBookmarkCount = 0;
        ca.isPublic = isPublic;
        ca.userPrompt = userPrompt;
        return ca;
    }


}
