package com.ssafy.hellojob.domain.coverlettercontent.entity;

import com.ssafy.hellojob.domain.exprience.entity.Experience;
import com.ssafy.hellojob.domain.project.entity.Project;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "cover_letter_experience")
public class CoverLetterExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cover_letter_experience")
    private Integer coverLetterExperienceId;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    @JoinColumn (name = "experience_id")
    private Experience experience;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cover_letter_content_id", nullable = false)
    private CoverLetterContent coverLetterContent;

    @Builder
    public CoverLetterExperience(Integer coverLetterExperienceId, Experience experience, Project project, CoverLetterContent coverLetterContent) {
        this.coverLetterExperienceId = coverLetterExperienceId;
        this.experience = experience;
        this.project = project;
        this.coverLetterContent = coverLetterContent;
    }
}
