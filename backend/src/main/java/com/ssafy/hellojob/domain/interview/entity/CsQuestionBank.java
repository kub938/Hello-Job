package com.ssafy.hellojob.domain.interview.entity;

import com.ssafy.hellojob.global.common.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "cs_question_bank")
public class CsQuestionBank extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cs_question_memo_id", nullable = false)
    private Integer csQuestionBankId;

    @Column(name = "cs_question", nullable = false)
    private String csQuestion;

    @Enumerated(EnumType.STRING)
    @Column(name = "cs_category", nullable = false)
    private CsCategory csCategory;
}
