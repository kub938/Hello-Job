package com.ssafy.hellojob.global.common.commitevent.listener;

import com.ssafy.hellojob.global.common.commitevent.entity.InterviewAnswerSavedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@Slf4j
public class InterviewAnswerEventListener {

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void afterInterviewAnswerSaved(InterviewAnswerSavedEvent event) {
        log.info("✅ 커밋 완료 후 로그: {}", event.getInterviewAnswer().getInterviewAnswer());
    }
}
