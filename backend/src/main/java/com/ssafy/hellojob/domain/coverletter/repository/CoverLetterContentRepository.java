package com.ssafy.hellojob.domain.coverletter.repository;

import com.ssafy.hellojob.domain.coverletter.dto.response.ContentQuestionStatusDto;
import com.ssafy.hellojob.domain.coverletter.entity.CoverLetterContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CoverLetterContentRepository extends JpaRepository<CoverLetterContent, Integer> {

    @Query("SELECT clc FROM CoverLetterContent clc " +
            "WHERE clc.coverLetter.coverLetterId =:coverLetterId " +
            "AND clc.contentNumber = :contentNumber")
    Optional<CoverLetterContent> findByCoverLetterIdAndContentNumber(
            @Param("coverLetterId") Integer coverLetterId, @Param("contentNumber") Integer contentNumber);

    @Query("SELECT new com.ssafy.hellojob.domain.coverletter.dto.response.ContentQuestionStatusDto(" +
    "clc.contentNumber, clc.contentStatus) FROM CoverLetterContent clc " +
    "WHERE clc.coverLetter.coverLetterId = :coverLetterId " +
    "ORDER BY clc.contentNumber")
    List<ContentQuestionStatusDto> getCoverLetterContentStatuses(@Param("coverLetterId")Integer coverLetterId);
}
