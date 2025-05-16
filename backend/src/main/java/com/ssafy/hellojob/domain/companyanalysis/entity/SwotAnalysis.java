package com.ssafy.hellojob.domain.companyanalysis.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "swot_analysis")
public class SwotAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "swot_analysis_id", nullable = false)
    private Integer swotAnalysisId;

    @Column(name = "strengths_content", columnDefinition = "TEXT")
    private String strengthsContent;

    @Column(name = "strengths_tag", columnDefinition = "TEXT")
    private String strengthsTag;

    @Column(name = "weaknesses_content", columnDefinition = "TEXT")
    private String weaknessesContent;

    @Column(name = "weaknesses_tag", columnDefinition = "TEXT")
    private String weaknessesTag;

    @Column(name = "opportunities_content", columnDefinition = "TEXT")
    private String opportunitiesContent;

    @Column(name = "opportunities_tag", columnDefinition = "TEXT")
    private String opportunitiesTag;

    @Column(name = "threats_content", columnDefinition = "TEXT")
    private String threatsContent;

    @Column(name = "threats_tag", columnDefinition = "TEXT")
    private String threatsTag;

    @Column(name = "swot_summary", columnDefinition = "TEXT")
    private String swotSummary;


    public static SwotAnalysis of(String strengthsContent, String strengthsTag, String weaknessesContent, String weaknessesTag, String opportunitiesContent, String opportunitiesTag, String threatsContent, String threatsTag, String swotSummary){
        SwotAnalysis swotAnalysis = new SwotAnalysis();
        swotAnalysis.strengthsContent = strengthsContent;
        swotAnalysis.strengthsTag = strengthsTag;
        swotAnalysis.weaknessesContent = weaknessesContent;
        swotAnalysis.weaknessesTag = weaknessesTag;
        swotAnalysis.opportunitiesContent = opportunitiesContent;
        swotAnalysis.opportunitiesTag = opportunitiesTag;
        swotAnalysis.threatsContent = threatsContent;
        swotAnalysis.threatsTag = threatsTag;
        swotAnalysis.swotSummary = swotSummary;
        return swotAnalysis;
    }

}
