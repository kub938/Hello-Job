package com.ssafy.hellojob.global.common.scheduler;

import com.ssafy.hellojob.domain.interview.entity.InterviewAnswer;
import com.ssafy.hellojob.domain.interview.entity.InterviewVideo;
import com.ssafy.hellojob.domain.interview.repository.InterviewVideoRepository;
import com.ssafy.hellojob.domain.interview.service.S3UploadService;
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

    private final S3UploadService s3UploadService;
    private final InterviewVideoRepository interviewVideoRepository;

    // 매일 자정에 실행
    @Transactional
    @Scheduled(cron = "0 0 0 * * ?")
    public void deleteInterviewVideo() {
        log.debug("{}시 면접 삭제 시작", LocalTime.now());

        try {
            LocalDateTime cutoff = LocalDateTime.now().minusDays(2);
            List<InterviewVideo> videos = interviewVideoRepository.findAllByEndBeforeAndInterviewTitleIsNull(cutoff);

            interviewVideoRepository.deleteAll(videos); // Cascade로 InterviewAnswer도 함께 삭제됨

            for(InterviewVideo video:videos){
                for(InterviewAnswer answer:video.getInterviewAnswers()){
                    s3UploadService.deleteVideo(answer.getInterviewVideoUrl());
                }
            }

        } catch (Exception e) {
            log.error("❌ 면접 삭제 중 예외 발생", e);
        }

        log.debug("면접 삭제 완료");
    }


}