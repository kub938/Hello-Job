package com.ssafy.hellojob.domain.interview.entity;

import com.ssafy.hellojob.global.common.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "personality_question_bank")
public class PersonalityQuestionBank extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interview_question_memo_id", nullable = false)
    private Integer personalityQuestionBankId;

    @Column(name = "personality_question", nullable = false)
    private String personalityQuestion;
}
