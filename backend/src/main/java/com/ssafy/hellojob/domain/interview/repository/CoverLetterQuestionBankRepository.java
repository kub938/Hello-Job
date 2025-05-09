package com.ssafy.hellojob.domain.interview.repository;

import com.ssafy.hellojob.domain.interview.entity.CoverLetterInterview;
import com.ssafy.hellojob.domain.interview.entity.CoverLetterQuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoverLetterQuestionBankRepository extends JpaRepository<CoverLetterQuestionBank, Integer> {

    List<CoverLetterQuestionBank> findByCoverLetterInterview(CoverLetterInterview coverLetterInterview);

}
