package com.ssafy.hellojob.domain.interview.repository;

import com.ssafy.hellojob.domain.coverletter.entity.CoverLetter;
import com.ssafy.hellojob.domain.interview.entity.CoverLetterInterview;
import com.ssafy.hellojob.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CoverLetterInterviewRepository extends JpaRepository<CoverLetterInterview, Integer> {

    Optional<CoverLetterInterview> findByUserAndCoverLetter(User user, CoverLetter coverLetter);

}
