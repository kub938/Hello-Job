package com.ssafy.hellojob.domain.interview.service;

import com.ssafy.hellojob.domain.interview.dto.request.SttRequest;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.stereotype.Component;

import java.util.concurrent.BlockingQueue;

@Slf4j
@Component
@RequiredArgsConstructor
public class SttWorker implements InitializingBean {

    private final BlockingQueue<SttRequest> sttRequestQueue;
    private final SttService sttService;
    private final InterviewAnswerSaveService interviewAnswerSaveService;


    // SttWorker.java
    @PostConstruct
    public void logQueueInstance() {
        log.info("🧪 SttWorker queue instance: {}", sttRequestQueue);
    }


    @Override
    public void afterPropertiesSet() {
        log.info("🚀 STT 워커 초기화 시작");
        Thread workerThread = new Thread(() -> {
            log.info("🧵 STT 워커 스레드 시작됨");
            while (true) {
                try {
                    SttRequest request = sttRequestQueue.take(); // 큐에서 하나 꺼냄
                    log.info("📥 STT 요청 처리 시작: {}", request.getInterviewAnswerId());

                    String result = sttService.transcribeAudioSync(
                            request.getInterviewAnswerId(),
                            request.getFileBytes(),
                            request.getOriginalFilename()
                    );

                    interviewAnswerSaveService.saveInterviewAnswer(
                            request.getUserId(), result, request.getInterviewAnswerId());

                } catch (Exception e) {
                    log.error("❌ STT 처리 중 오류 발생", e);
                    // 실패 시 처리 전략: 무시/재시도/데이터 저장 등
                }
            }
        });

        workerThread.setDaemon(true); // Spring 종료 시 같이 종료
        workerThread.setName("SttWorkerThread");
        workerThread.start();
    }
}

