package com.ssafy.hellojob.domain.coverletter.entity;

import com.ssafy.hellojob.global.common.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "cover_letter_content")
public class CoverLetterContent extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cover_letter_content_id")
    private Integer contentId;

    @OneToOne
    @JoinColumn(name = "cover_letter_id", nullable = false)
    private CoverLetter coverLetter;

    @OneToOne
    @JoinColumn(name = "chat_log_id", nullable = false)
    private ChatLog chatLog;

    @Column(name = "cover_letter_content_number", nullable = false)
    private Integer contentNumber;

    @Column(name = "cover_letter_content_question", nullable = false, columnDefinition = "TEXT")
    private String contentQuestion;

    @Column(name = "cover_letter_content_detail", columnDefinition = "TEXT")
    private String contentDetail;

    @Column(name = "cover_letter_content_length")
    private Integer contentLength;

    @Column(name = "cover_letter_content_status", nullable = false)
    private CoverLetterContentStatus coverLetterContentStatus;

    @Column(name = "cover_letter_content_first_prompt", columnDefinition = "TEXT")
    private String contentFirstPrompt;

    @Builder
    public CoverLetterContent(Integer contentId, CoverLetter coverLetter, ChatLog chatLog, Integer contentNumber, String contentQuestion, String contentDetail, Integer contentLength, CoverLetterContentStatus coverLetterContentStatus, String contentFirstPrompt) {
        this.contentId = contentId;
        this.coverLetter = coverLetter;
        this.chatLog = chatLog;
        this.contentNumber = contentNumber;
        this.contentQuestion = contentQuestion;
        this.contentDetail = contentDetail;
        this.contentLength = contentLength;
        this.coverLetterContentStatus = coverLetterContentStatus;
        this.contentFirstPrompt = contentFirstPrompt;
    }
}
