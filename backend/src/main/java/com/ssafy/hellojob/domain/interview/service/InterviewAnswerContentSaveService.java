package com.ssafy.hellojob.domain.interview.service;

import com.ssafy.hellojob.domain.interview.entity.InterviewAnswer;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewAnswerContentSaveService {

    // 저장 함수
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveAnswer(String answer, InterviewAnswer interviewAnswer){
        interviewAnswer.addInterviewAnswer(answer);
        log.debug("😎 답변 저장 완");
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveUrl(String url, InterviewAnswer interviewAnswer){
        throw new BaseException(ErrorCode.TEST_ERROR);
//        interviewAnswer.addInterviewVideoUrl(url);
//        log.debug("😎 영상 저장 완");
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveTime(String time, InterviewAnswer interviewAnswer){
        interviewAnswer.addVideoLength(time);
        log.debug("😎 시간 저장 완");
    }

}
