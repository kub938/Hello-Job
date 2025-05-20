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
                    SttRequest request = sttRequestQueue.take();
                    log.info("📥 STT 요청 처리 시작: {}", request.getInterviewAnswerId());

                    String result;
                    try {
                        result = sttService.transcribeAudioSync(
                                request.getInterviewAnswerId(),
                                request.getFileBytes(),
                                request.getOriginalFilename()
                        );
                    } catch (Exception sttException) {
                        log.error("❌ STT 변환 중 내부 예외", sttException);
                        result = "stt 변환에 실패했습니다";  // 실패 메시지 fallback
                    }

                    try {
                        interviewAnswerSaveService.saveInterviewAnswer(
                                request.getUserId(), result, request.getInterviewAnswerId());
                    } catch (Exception saveException) {
                        log.error("❌ 답변 저장 중 예외 발생", saveException);
                    }

                } catch (Exception e) {
                    log.error("❌ 큐에서 요청 take 실패", e);
                    // request 객체가 없으므로 여기선 save 못 함
                }

            }
        });

        workerThread.setDaemon(true); // Spring 종료 시 같이 종료
        workerThread.setName("SttWorkerThread");
        workerThread.start();
    }
}

