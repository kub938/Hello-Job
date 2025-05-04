package com.ssafy.hellojob.domain.coverletter.repository;

import com.ssafy.hellojob.domain.coverletter.entity.CoverLetter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface CoverLetterRepository extends JpaRepository<CoverLetter, Integer> {
    @Modifying
    @Transactional
    @Query("UPDATE CoverLetter c SET c.updatedAt = CURRENT_TIMESTAMP WHERE c.coverLetterId = :coverLetterId")
    void touch(@Param("coverLetterId") Integer coverLetterId);
}
