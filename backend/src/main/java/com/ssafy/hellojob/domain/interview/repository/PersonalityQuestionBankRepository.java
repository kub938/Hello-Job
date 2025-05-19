package com.ssafy.hellojob.domain.interview.repository;

import com.ssafy.hellojob.domain.interview.entity.PersonalityQuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonalityQuestionBankRepository extends JpaRepository<PersonalityQuestionBank, Integer> {

    List<PersonalityQuestionBank> findTop100ByOrderByPersonalityQuestionBankId();
}
