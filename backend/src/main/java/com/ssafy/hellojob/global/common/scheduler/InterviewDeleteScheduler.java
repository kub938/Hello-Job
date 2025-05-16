package com.ssafy.hellojob.global.common.scheduler;

import com.ssafy.hellojob.domain.interview.entity.InterviewVideo;
import com.ssafy.hellojob.domain.interview.repository.InterviewVideoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class InterviewDeleteScheduler {

    private final InterviewVideoRepository interviewVideoRepository;

    // 매일 자정에 실행
    @Transactional
    @Scheduled(cron = "30 18 15 * * ?")
    public void deleteInterviewVideo() {
        log.debug("{}시 면접 삭제 시작", LocalTime.now());

        try {
            LocalDateTime cutoff = LocalDateTime.now().minusDays(1);
            List<InterviewVideo> videos = interviewVideoRepository.findAllByEndBeforeAndInterviewTitleIsNull(cutoff);

            interviewVideoRepository.deleteAll(videos); // Cascade로 InterviewAnswer도 함께 삭제됨

        } catch (Exception e) {
            log.error("❌ 면접 삭제 중 예외 발생", e);
        }

        log.debug("면접 삭제 완료");
    }


}