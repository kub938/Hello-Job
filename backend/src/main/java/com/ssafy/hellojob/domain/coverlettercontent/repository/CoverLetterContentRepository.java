package com.ssafy.hellojob.domain.coverlettercontent.repository;

import com.ssafy.hellojob.domain.coverletter.entity.CoverLetter;
import com.ssafy.hellojob.domain.coverlettercontent.dto.response.ContentQuestionStatusDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.response.CoverLetterOnlyContentDto;
import com.ssafy.hellojob.domain.coverlettercontent.entity.CoverLetterContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface CoverLetterContentRepository extends JpaRepository<CoverLetterContent, Integer> {

    @Query("SELECT new com.ssafy.hellojob.domain.coverlettercontent.dto.response.ContentQuestionStatusDto(" +
            "clc.contentId, clc.contentNumber, clc.contentStatus) FROM CoverLetterContent clc " +
            "WHERE clc.coverLetter.coverLetterId = :coverLetterId " +
            "ORDER BY clc.contentNumber")
    List<ContentQuestionStatusDto> getCoverLetterContentStatuses(@Param("coverLetterId") Integer coverLetterId);

    @Query("""
            SELECT clc.contentId
            FROM CoverLetterContent clc
            WHERE clc.coverLetter.coverLetterId = :coverLetterId
            ORDER BY clc.contentNumber
            """)
    List<Integer> findFirstContentIdByCoverLetterId(@Param("coverLetterId") Integer coverLetterId, Pageable pageable);

    @Query("""
            SELECT clc.contentId
            FROM CoverLetterContent clc
            WHERE clc.coverLetter.coverLetterId = :coverLetterId
            ORDER BY clc.contentNumber
            """)
    List<Integer> findContentIdByCoverLetterId(@Param("coverLetterId") Integer coverLetterId);

    List<CoverLetterContent> findByCoverLetter(CoverLetter coverLetter);

    @Query("""
            SELECT new com.ssafy.hellojob.domain.coverlettercontent.dto.response.CoverLetterOnlyContentDto(
            clc.contentId, clc.contentNumber, clc.contentQuestion, clc.contentDetail, clc.contentLength)
            FROM CoverLetterContent clc
            WHERE clc.coverLetter.coverLetterId = :coverLetterId
            ORDER BY clc.contentNumber
            """)
    List<CoverLetterOnlyContentDto> findContentByCoverLetterId(@Param("coverLetterId") Integer coverLetterId);

    @Query("""
            SELECT DISTINCT c
            FROM CoverLetterContent c
            LEFT JOIN FETCH c.experiences cle
            WHERE c.coverLetter.coverLetterId = :coverLetterId
            """)
    List<CoverLetterContent> findContentsWithExperiences(@Param("coverLetterId") Integer coverLetterId);

    @Query("""
    SELECT c.coverLetter.coverLetterId
    FROM CoverLetterContent c
    WHERE c.contentId = :contentId""")
    Optional<Integer> findCoverLetterIdByContentId(@Param("contentId") Integer contentId);
}