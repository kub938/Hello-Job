package com.ssafy.hellojob.domain.interview.service;

import com.ssafy.hellojob.domain.interview.dto.request.SttRequest;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class SttQueueService {

    private final BlockingQueue<SttRequest> sttRequestQueue;
    private final InterviewAnswerSaveService interviewAnswerSaveService;

    public void submitRequest(SttRequest request) {
        log.debug("😎 큐에 stt 요청 offer 시작");
        try {
            boolean success = sttRequestQueue.offer(request, 5, TimeUnit.SECONDS);
            if (!success) {
                log.warn("❌ STT 큐가 가득 차서 요청을 넣지 못했습니다");
                throw new BaseException(ErrorCode.STT_QUEUE_FULL);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.debug("😱 삐상 !!! 큐에 stt 요청 넣는 중 인터럽트 발생 !!!: {}", e);
            interviewAnswerSaveService.saveInterviewAnswer(
                    request.getUserId(), "stt 변환에 실패했습니다", request.getInterviewAnswerId());
        }
    }


    // SttQueueService.java
    @PostConstruct
    public void logQueueInstance() {
        log.info("🧪 SttQueueService queue instance: {}", sttRequestQueue);
    }

}
