package com.ssafy.hellojob.domain.coverletter.repository;

import com.ssafy.hellojob.domain.coverletter.entity.CoverLetterExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CoverLetterExperienceRepository extends JpaRepository<CoverLetterExperience, Integer> {

    @Query("""
            SELECT cle.experienceId
            FROM CoverLetterExperience cle
            WHERE cle.coverLetterContent.coverLetter.coverLetterId = :coverLetterId
            AND cle.coverLetterContent.contentNumber = :contentNumber
            AND cle.experienceId IS NOT NULL
            """)
    List<Integer> findExperiencesByCoverLetterIdAndContentNumber(
            @Param("coverLetterId") Integer coverLetterId,
            @Param("contentNumber") Integer contentNumber);

    @Query("""
            SELECT cle.projectId
            FROM CoverLetterExperience cle
            WHERE cle.coverLetterContent.coverLetter.coverLetterId = :coverLetterId
            AND cle.coverLetterContent.contentNumber = :contentNumber
            AND cle.projectId IS NOT NULL
            """)
    List<Integer> findProjectsByCoverLetterIdAndContentNumber(
            @Param("coverLetterId") Integer coverLetterId,
            @Param("contentNumber") Integer contentNumber);

}

