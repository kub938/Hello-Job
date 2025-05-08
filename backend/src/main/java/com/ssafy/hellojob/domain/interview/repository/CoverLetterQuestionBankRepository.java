package com.ssafy.hellojob.domain.interview.repository;

import com.ssafy.hellojob.domain.interview.entity.CoverLetterQuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CoverLetterQuestionBankRepository extends JpaRepository<CoverLetterQuestionBank, Integer> {
}
