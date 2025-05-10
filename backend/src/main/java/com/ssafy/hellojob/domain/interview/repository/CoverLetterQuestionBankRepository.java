package com.ssafy.hellojob.domain.interview.repository;

import com.ssafy.hellojob.domain.interview.entity.CoverLetterInterview;
import com.ssafy.hellojob.domain.interview.entity.CoverLetterQuestionBank;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CoverLetterQuestionBankRepository extends JpaRepository<CoverLetterQuestionBank, Integer> {

    List<CoverLetterQuestionBank> findByCoverLetterInterview(CoverLetterInterview coverLetterInterview);

    @EntityGraph(attributePaths = {"coverLetterInterview"})
    @Query("SELECT i FROM CoverLetterQuestionBank i WHERE i.coverLetterQuestionBankId = :coverLetterQuestionBankId")
    Optional<CoverLetterQuestionBank> findByIdWithCoverLetterInterview(Integer coverLetterQuestionBankId);
}
