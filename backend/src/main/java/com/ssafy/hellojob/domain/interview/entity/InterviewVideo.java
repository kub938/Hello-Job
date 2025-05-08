package com.ssafy.hellojob.domain.interview.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "interview_video")
public class InterviewVideo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interview_video", nullable = false)
    private Integer interviewVideo;

    @ManyToOne
    @JoinColumn(name = "cover_letter_interview")
    private CoverLetterInterview coverLetterInterview;

    @ManyToOne
    @JoinColumn(name = "interview")
    private Interview interview;

    @Column(name = "interview_video_url")
    private String interviewVideoUrl;

    @Column(name = "select_question", nullable = false)
    private boolean selectQuestion;

    @Column(name = "interview_feedback")
    private String interviewFeedback;

    @Column(name = "start")
    private LocalDateTime start;

    @Column(name = "end")
    private LocalDateTime end;



}
