package com.ssafy.hellojob.domain.interview.entity;

import com.ssafy.hellojob.global.common.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "interview_answer")
public class InterviewAnswer extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interview_answer_id", nullable = false)
    private Integer interviewAnswerId;

    @ManyToOne
    @JoinColumn(name = "interview_video_id")
    private InterviewVideo interviewVideo;

    @Column(name = "interview_question")
    private String interviewQuestion;

    @Column(name = "interview_answer")
    private String interviewAnswer;

    @Enumerated(EnumType.STRING)
    @Column(name = "interview_question_category")
    private InterviewQuestionCategory interviewQuestionCategory;

    @Column(name = "interview_answer_feedback", columnDefinition = "TEXT")
    private String interviewAnswerFeedback;

    @Column(name = "interview_follow_up_question", columnDefinition = "TEXT")
    private String interviewFollowUpQuestion;

    @Column(name = "video_length")
    private String videoLength;

    @Column(name = "interview_video_url")
    private String interviewVideoUrl;

    public static InterviewAnswer of(InterviewVideo interviewVideo, String interviewQuestion, InterviewQuestionCategory interviewQuestionCategory){
        InterviewAnswer answer = new InterviewAnswer();
        answer.interviewVideo = interviewVideo;
        answer.interviewQuestion = interviewQuestion;
        answer.interviewQuestionCategory = interviewQuestionCategory;
        return answer;
    }

    public void addInterviewAnswer(String interviewAnswer){
        this.interviewAnswer = interviewAnswer;
    }
    public void addInterviewAnswerFeedback(String interviewAnswerFeedback){
        this.interviewAnswerFeedback = interviewAnswerFeedback;
    }
    public void addInterviewFollowUpQuestion(String interviewFollowUpQuestion){
        this.interviewFollowUpQuestion = interviewFollowUpQuestion;
    }

    public void addInterviewVideoUrl(String interviewVideoUrl){
        this.interviewVideoUrl = interviewVideoUrl;
    }

    public void addVideoLength(String videoLength){
        this.videoLength = videoLength;
    }



}
