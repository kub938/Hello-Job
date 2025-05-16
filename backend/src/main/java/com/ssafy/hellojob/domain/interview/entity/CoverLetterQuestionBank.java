package com.ssafy.hellojob.domain.interview.entity;

import com.ssafy.hellojob.global.common.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "cover_letter_question_bank")
public class CoverLetterQuestionBank extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cover_letter_question_bank", nullable = false)
    private Integer coverLetterQuestionBankId;

    @ManyToOne
    @JoinColumn(name = "cover_letter_interview_id")
    private CoverLetterInterview coverLetterInterview;

    @Column(name = "cover_letter_question")
    private String coverLetterQuestion;

    public static CoverLetterQuestionBank of(CoverLetterInterview coverLetterInterview, String coverLetterQuestion){
        CoverLetterQuestionBank coverLetterQuestionBank = new CoverLetterQuestionBank();
        coverLetterQuestionBank.coverLetterInterview = coverLetterInterview;
        coverLetterQuestionBank.coverLetterQuestion = coverLetterQuestion;
        return coverLetterQuestionBank;
    }

}
