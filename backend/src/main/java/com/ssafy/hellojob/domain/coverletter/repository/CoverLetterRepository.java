package com.ssafy.hellojob.domain.coverletter.repository;

import com.ssafy.hellojob.domain.coverletter.dto.response.MyPageCoverLetterDto;
import com.ssafy.hellojob.domain.coverletter.dto.response.ScheduleCoverLetterDto;
import com.ssafy.hellojob.domain.coverletter.entity.CoverLetter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface CoverLetterRepository extends JpaRepository<CoverLetter, Integer> {
    @Modifying
    @Transactional
    @Query("UPDATE CoverLetter c SET c.updatedAt = CURRENT_TIMESTAMP WHERE c.coverLetterId = :coverLetterId")
    void touch(@Param("coverLetterId") Integer coverLetterId);

    @Query("""
            SELECT new com.ssafy.hellojob.domain.coverletter.dto.response.MyPageCoverLetterDto(
            cl.coverLetterId,
            cl.coverLetterTitle,
            SUBSTRING(con.contentDetail, 1, 100),
            c.companyName,
            jr.jobRoleSnapshotName,
            jr.jobRoleSnapshotCategory,
            cl.finish,
            cl.updatedAt)
            FROM CoverLetter cl
            LEFT JOIN cl.jobRoleSnapshot jr
            JOIN cl.companyAnalysis ca
            JOIN ca.company c
            LEFT JOIN cl.contents con ON con.contentNumber = 1
            WHERE cl.user.userId = :userId
            """)
    Page<MyPageCoverLetterDto> getCoverLettersByUser(@Param("userId") Integer userId, Pageable pageable);

    @Query("""
            SELECT DISTINCT cl
            FROM CoverLetter cl
            LEFT JOIN FETCH cl.jobRoleSnapshot jr
            JOIN FETCH cl.companyAnalysis ca
            JOIN FETCH ca.company co
            JOIN FETCH ca.dartAnalysis da
            LEFT JOIN FETCH ca.newsAnalysis na
            WHERE cl.coverLetterId = :coverLetterId
            """)
    CoverLetter findFullCoverLetterDetail(@Param("coverLetterId") Integer coverLetterId);

    @Query("""
            SELECT new com.ssafy.hellojob.domain.coverletter.dto.response.ScheduleCoverLetterDto(
            c.coverLetterId, c.coverLetterTitle, c.updatedAt)
            FROM CoverLetter c
            WHERE c.user.userId = :userId
            ORDER BY c.updatedAt DESC
            """)
    List<ScheduleCoverLetterDto> findCoverLetterForSchedule(@Param("userId") Integer userId);
}
