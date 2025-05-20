package com.ssafy.hellojob.domain.interview.service;

import com.ssafy.hellojob.domain.interview.dto.request.SttRequest;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.concurrent.BlockingQueue;

@Service
@RequiredArgsConstructor
public class SttQueueService {

    private final BlockingQueue<SttRequest> sttRequestQueue;

    public void submitRequest(SttRequest request) {
        try {
            sttRequestQueue.put(request); // 대기 상태면 blocking
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BaseException(ErrorCode.STT_TRANSCRIBE_INTERRUPTED);
        }
    }
}
