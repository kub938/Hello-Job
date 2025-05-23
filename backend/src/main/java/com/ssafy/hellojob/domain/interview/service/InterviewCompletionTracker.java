package com.ssafy.hellojob.domain.interview.service;

import lombok.Data;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class InterviewCompletionTracker {

    private final Map<Integer, CompletionStatus> statusMap = new ConcurrentHashMap<>();


    public void markFeedbackDone(Integer interviewInfoId) {
        statusMap.computeIfAbsent(interviewInfoId, k -> new CompletionStatus()).setFeedbackDone(true);
    }

    public void markVideoDone(Integer interviewInfoId) {
        statusMap.computeIfAbsent(interviewInfoId, k -> new CompletionStatus()).setVideoDone(true);
    }

    public boolean isAllDoneAndNotSent(Integer interviewInfoId) {
        CompletionStatus status = statusMap.get(interviewInfoId);
        return status != null && status.isFeedbackDone() && status.isVideoDone() && !status.isSent();
    }

    public void markSent(Integer interviewInfoId) {
        CompletionStatus status = statusMap.get(interviewInfoId);
        if (status != null) status.setSent(true);
    }

    @Data
    public static class CompletionStatus {
        private boolean feedbackDone = false;
        private boolean videoDone = false;
        private boolean sent = false;
    }

}
