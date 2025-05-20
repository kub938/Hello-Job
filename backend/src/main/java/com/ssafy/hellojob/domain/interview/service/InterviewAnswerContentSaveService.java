package com.ssafy.hellojob.domain.interview.service;

import com.ssafy.hellojob.domain.interview.entity.InterviewAnswer;
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
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveUrl(String url, InterviewAnswer interviewAnswer){
        interviewAnswer.addInterviewAnswer(url);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveTime(String time, InterviewAnswer interviewAnswer){
        interviewAnswer.addInterviewAnswer(time);
    }

}
