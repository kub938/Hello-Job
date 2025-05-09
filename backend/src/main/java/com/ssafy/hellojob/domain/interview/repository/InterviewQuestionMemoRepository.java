package com.ssafy.hellojob.domain.interview.repository;

import com.ssafy.hellojob.domain.interview.entity.CoverLetterQuestionBank;
import com.ssafy.hellojob.domain.interview.entity.CsQuestionBank;
import com.ssafy.hellojob.domain.interview.entity.InterviewQuestionMemo;
import com.ssafy.hellojob.domain.interview.entity.PersonalityQuestionBank;
import com.ssafy.hellojob.domain.user.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewQuestionMemoRepository extends JpaRepository<InterviewQuestionMemo, Integer> {

    Optional<InterviewQuestionMemo> findByUserAndCsQuestionBank(User user, CsQuestionBank csQuestionBank);

    Optional<InterviewQuestionMemo> findByUserAndPersonalityQuestionBank(User user, PersonalityQuestionBank personalityQuestionBank);

    Optional<InterviewQuestionMemo> findByUserAndCoverLetterQuestionBank(User user, CoverLetterQuestionBank coverLetterQuestionBank);

    @EntityGraph(attributePaths = {"user"})
    Optional<InterviewQuestionMemo> findByIdWithUser(@NonNull Integer interviewQuestionMemoId);
    
}
