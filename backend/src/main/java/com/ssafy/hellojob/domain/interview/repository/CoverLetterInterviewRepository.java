package com.ssafy.hellojob.domain.interview.repository;

import com.ssafy.hellojob.domain.coverletter.entity.CoverLetter;
import com.ssafy.hellojob.domain.interview.entity.CoverLetterInterview;
import com.ssafy.hellojob.domain.user.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CoverLetterInterviewRepository extends JpaRepository<CoverLetterInterview, Integer> {

    Optional<CoverLetterInterview> findByUserAndCoverLetter(User user, CoverLetter coverLetter);

    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT i FROM CoverLetterInterview i WHERE i.coverLetterInterviewId = :coverLetterInterviewId")
    Optional<CoverLetterInterview> findByIdWithUser(Integer coverLetterInterviewId);

    @EntityGraph(attributePaths = {"user", "coverLetter"})
    @Query("SELECT i FROM CoverLetterInterview i WHERE i.user = :user AND i.coverLetter.coverLetterId = :coverLetterId")
    Optional<CoverLetterInterview> findByUserAndCoverLetterIdWithGraph(@Param("user") User user, @Param("coverLetterId") Integer coverLetterId);

}
