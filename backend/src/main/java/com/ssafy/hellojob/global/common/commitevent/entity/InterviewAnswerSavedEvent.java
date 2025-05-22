package com.ssafy.hellojob.global.common.commitevent.entity;

import com.ssafy.hellojob.domain.interview.entity.InterviewAnswer;

public class InterviewAnswerSavedEvent {
    private final InterviewAnswer interviewAnswer;

    public InterviewAnswerSavedEvent(InterviewAnswer interviewAnswer) {
        this.interviewAnswer = interviewAnswer;
    }

    public InterviewAnswer getInterviewAnswer() {
        return interviewAnswer;
    }
}
