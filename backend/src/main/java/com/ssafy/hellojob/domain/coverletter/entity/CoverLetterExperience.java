package com.ssafy.hellojob.domain.coverletter.entity;

import com.ssafy.hellojob.domain.exprience.entity.Experience;
import com.ssafy.hellojob.domain.project.entity.Project;
import jakarta.persistence.*;
import lombok.AccessLevel;
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

    @ManyToOne
    @JoinColumn(name = "experience_id")
    private Experience experience;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @OneToOne
    @JoinColumn(name = "cover_letter_content_id", nullable = false)
    private CoverLetterContent coverLetterContent;
}
