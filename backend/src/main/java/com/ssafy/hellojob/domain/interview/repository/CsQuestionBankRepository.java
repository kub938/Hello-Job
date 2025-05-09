package com.ssafy.hellojob.domain.interview.repository;

import com.ssafy.hellojob.domain.interview.entity.CsQuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CsQuestionBankRepository extends JpaRepository<CsQuestionBank, Integer> {

    @Query("SELECT c.csQuestionBankId FROM CsQuestionBank c")
    List<Integer> findAllIds();

}
