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
    private Integer interviewVideoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cover_letter_interview")
    private CoverLetterInterview coverLetterInterview;

    @ManyToOne(fetch = FetchType.LAZY)
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

    @Column(name = "video_length")
    private String videoLength;

    @Enumerated(EnumType.STRING)
    @Column(name = "interview_category")
    private InterviewCategory interviewCategory;

    public static InterviewVideo of(CoverLetterInterview coverLetterInterview, Interview interview, boolean selectQuestion, LocalDateTime start){
        InterviewVideo video = new InterviewVideo();
        video.coverLetterInterview = coverLetterInterview;
        video.interview = interview;
        video.selectQuestion = selectQuestion;
        video.start = start;

        return video;
    }

    public void addInterviewFeedback(String interviewFeedback){
        this.interviewFeedback = interviewFeedback;
    }

    public void addInterviewVideoUrl(String interviewVideoUrl){
        this.interviewVideoUrl = interviewVideoUrl;
    }

    public void addEndTime(LocalDateTime end){
        this.end = end;
    }

    public void addVideoLength(String videoLength){
        this.videoLength = videoLength;
    }

}
