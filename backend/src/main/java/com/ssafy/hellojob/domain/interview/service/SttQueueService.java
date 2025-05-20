package com.ssafy.hellojob.domain.interview.service;

import com.ssafy.hellojob.domain.interview.dto.request.SttRequest;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.BlockingQueue;

@Slf4j
@Service
@RequiredArgsConstructor
public class SttQueueService {

    private final BlockingQueue<SttRequest> sttRequestQueue;
    private final InterviewAnswerSaveService interviewAnswerSaveService;

    public void submitRequest(SttRequest request) {
        log.debug("😎 큐에 stt 요청 put 시작");
        try {
            sttRequestQueue.put(request); // 대기 상태면 blocking
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.debug("😱  삐상 !!! 큐에 stt 요청 넣는 과정에서 오류 발생 !!!: {}", e);
            interviewAnswerSaveService.saveInterviewAnswer(request.getUserId(), "stt 변환에 실패했습니다", request.getInterviewAnswerId());
        }
    }

    // SttQueueService.java
    @PostConstruct
    public void logQueueInstance() {
        log.info("🧪 SttQueueService queue instance: {}", sttRequestQueue);
    }

}
