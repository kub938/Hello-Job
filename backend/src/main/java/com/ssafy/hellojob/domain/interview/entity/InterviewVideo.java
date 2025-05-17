package com.ssafy.hellojob.domain.interview.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "interview_video")
public class InterviewVideo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interview_video_id", nullable = false)
    private Integer interviewVideoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cover_letter_interview_id")
    private CoverLetterInterview coverLetterInterview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id")
    private Interview interview;

    @Column(name = "select_question", nullable = false)
    private boolean selectQuestion;

    @Column(name = "interview_feedback", columnDefinition = "TEXT")
    private String interviewFeedback;

    @Column(name = "start")
    private LocalDateTime start;

    @Column(name = "end")
    private LocalDateTime end;

    @Enumerated(EnumType.STRING)
    @Column(name = "interview_category", nullable = false)
    private InterviewCategory interviewCategory;

    @Column(name = "interview_title")
    private String interviewTitle;

    @OneToMany(mappedBy = "interviewVideo", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<InterviewAnswer> interviewAnswers = new ArrayList<>();

    public static InterviewVideo of(CoverLetterInterview coverLetterInterview, Interview interview, boolean selectQuestion, LocalDateTime start, InterviewCategory interviewCategory){
        InterviewVideo video = new InterviewVideo();
        video.coverLetterInterview = coverLetterInterview;
        video.interview = interview;
        video.selectQuestion = selectQuestion;
        video.start = start;
        video.interviewCategory = interviewCategory;
        return video;
    }

    public void addInterviewFeedback(String interviewFeedback){
        this.interviewFeedback = interviewFeedback;
    }


    public void addEndTime(LocalDateTime end){
        this.end = end;
    }

    public void addTitle(String interviewTitle){ this.interviewTitle = interviewTitle; }

}
