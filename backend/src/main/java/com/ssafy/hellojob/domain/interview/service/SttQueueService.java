package com.ssafy.hellojob.domain.interview.service;

import com.ssafy.hellojob.domain.interview.dto.request.SttRequest;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
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

    public void submitRequest(SttRequest request) {
        log.debug("😎 큐에 stt 요청 put 시작");
        try {
            sttRequestQueue.put(request); // 대기 상태면 blocking
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BaseException(ErrorCode.STT_TRANSCRIBE_INTERRUPTED);
        }
    }

    // SttQueueService.java
    @PostConstruct
    public void logQueueInstance() {
        log.info("🧪 SttQueueService queue instance: {}", sttRequestQueue);
    }

}
