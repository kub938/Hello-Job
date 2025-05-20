package com.ssafy.hellojob.domain.interview.service;

import com.ssafy.hellojob.domain.interview.entity.InterviewAnswer;
import com.ssafy.hellojob.domain.interview.repository.InterviewAnswerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewAnswerContentSaveService {

    private final InterviewAnswerRepository interviewAnswerRepository;

    // 저장 함수
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveAnswer(String answer, InterviewAnswer interviewAnswer){
        log.debug("😎 id: {}, saveAnswer에 들어온 값: {}", interviewAnswer.getInterviewAnswerId(), answer);

        if(answer == null){
            answer = "stt 변환에 실패했습니다";
        }

        interviewAnswer.addInterviewAnswer(answer);
        interviewAnswerRepository.save(interviewAnswer);
        log.debug("😎 답변 저장 완");
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveUrl(String url, InterviewAnswer interviewAnswer){
        interviewAnswer.addInterviewVideoUrl(url);
        log.debug("😎 영상 저장 완");
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveTime(String time, InterviewAnswer interviewAnswer){
        interviewAnswer.addVideoLength(time);
        log.debug("😎 시간 저장 완");
    }

}
