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

    public boolean isAllDone(Integer interviewInfoId) {
        CompletionStatus status = statusMap.get(interviewInfoId);
        return status != null && status.isFeedbackDone() && status.isVideoDone();
    }

    @Data
    public static class CompletionStatus {
        private boolean feedbackDone = false;
        private boolean videoDone = false;
    }

}
