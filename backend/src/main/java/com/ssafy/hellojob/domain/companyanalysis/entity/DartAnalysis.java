package com.ssafy.hellojob.domain.companyanalysis.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "dart_analysis")
public class DartAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dart_analysis_id", nullable = false)
    private Long dartAnalysisId;

    @Column(name = "dart_brand")
    private String dartBrand;

    @Column(name = "dart_company_analysis")
    private String dartCompanyAnalysis;

    @Column(name = "dart_vision")
    private String dartVision;

    @Column(name = "dart_financial_summary")
    private String dartFinancialSummary;

    @Column(name = "dart_company_analysis_basic", nullable = false)
    private boolean dartCompanyAnalysisBasic;

    @Column(name = "dart_company_analysis_plus", nullable = false)
    private boolean dartCompanyAnalysisPlus;

    @Column(name = "dart_company_analysis_financial_data", nullable = false)
    private boolean dartCompanyAnalysisFinancialData;

    public static DartAnalysis of(String brand, String analysis, String vision, String summary,
                                  boolean basic, boolean plus, boolean financial) {
        DartAnalysis dart = new DartAnalysis();
        dart.dartBrand = brand;
        dart.dartCompanyAnalysis = analysis;
        dart.dartVision = vision;
        dart.dartFinancialSummary = summary;
        dart.dartCompanyAnalysisBasic = basic;
        dart.dartCompanyAnalysisPlus = plus;
        dart.dartCompanyAnalysisFinancialData = financial;
        return dart;
    }

}
