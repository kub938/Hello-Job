package com.ssafy.hellojob.global.common.scheduler;

import com.ssafy.hellojob.domain.user.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class TokenResetScheduler {

    private final UserRepository userRepository;

    @PostConstruct
    public void init() {
        log.warn("✅ TokenResetScheduler 빈 등록 완료됨");
    }

    // 매일 자정에 실행
    @Scheduled(cron = "0 0 0 * * ?")
    public void resetTokens() {
        log.debug("{}시 토큰 리셋 시작", LocalTime.now());
        try {
            userRepository.resetAllTokens(3); // 모든 사용자의 토큰을 3으로 리셋
        } catch (Exception e) {
            log.error("❌ 토큰 리셋 중 예외 발생", e);
        }

        log.debug("토큰 리셋 완료");
    }

    @Scheduled(fixedRate = 60000)
    public void testScheduler() {
        System.out.println("🔥 [스케줄러 실행] testScheduler 동작 중");
        log.info("🔔 [스케줄러] 테스트 스케줄러 동작 확인");
    }


}