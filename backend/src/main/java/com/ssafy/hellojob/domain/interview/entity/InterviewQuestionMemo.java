package com.ssafy.hellojob.domain.interview.entity;

import com.ssafy.hellojob.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "interview_question_memo")
public class InterviewQuestionMemo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interview_question_memo_id", nullable = false)
    private Integer interviewQuestionMemoId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "cs_question_bank_id")
    private CsQuestionBank csQuestionBank;

    @ManyToOne
    @JoinColumn(name = "personality_question_bank_id")
    private PersonalityQuestionBank personalityQuestionBank;

    @ManyToOne
    @JoinColumn(name = "cover_letter_question_bank_id")
    private CoverLetterQuestionBank coverLetterQuestionBank;

    @Column(name = "memo", nullable = false)
    private String memo;

    public void updateMemo(String memo) {
        this.memo = memo;
    }

}
