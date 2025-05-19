package com.ssafy.hellojob.domain.interview.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.hellojob.domain.interview.dto.response.EndInterviewResponseDto;
import com.ssafy.hellojob.domain.interview.dto.response.InterviewFeedbackFastAPIResponseDto;
import com.ssafy.hellojob.domain.interview.dto.response.SingleInterviewFeedbackFastAPIResponseDto;
import com.ssafy.hellojob.domain.interview.entity.InterviewAnswer;
import com.ssafy.hellojob.domain.interview.entity.InterviewVideo;
import com.ssafy.hellojob.domain.interview.repository.InterviewAnswerRepository;
import com.ssafy.hellojob.domain.interview.repository.InterviewVideoRepository;
import com.ssafy.hellojob.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.ssafy.hellojob.global.exception.ErrorCode.SERIALIZATION_FAIL;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewFeedbackSaveService {

    private final InterviewAnswerRepository interviewAnswerRepository;
    private final InterviewVideoRepository interviewVideoRepository;

    @Transactional
    public EndInterviewResponseDto saveTitle(InterviewVideo interviewVideo){
        return EndInterviewResponseDto.builder()
                .interviewVideoId(interviewVideo.getInterviewVideoId())
                .build();
    }


    @Transactional
    public EndInterviewResponseDto saveFeedback(InterviewFeedbackFastAPIResponseDto fastAPIResponseDto, List<InterviewAnswer> interviewAnswers, InterviewVideo interviewVideo){
        
        log.debug("😎 saveFeedback 함수 들어옴");
        log.debug("😎 fastAPIResponseDto.getOverall_feedback() : {}", fastAPIResponseDto.getOverall_feedback());

        // 꼬리 질문 json 직렬화
        interviewVideo.addInterviewFeedback(fastAPIResponseDto.getOverall_feedback());
        interviewVideoRepository.save(interviewVideo);

        for (SingleInterviewFeedbackFastAPIResponseDto singleInterviewFeedback : fastAPIResponseDto.getSingle_feedbacks()) {

            InterviewAnswer targetAnswer = interviewAnswers.stream()
                    .filter(ans -> ans.getInterviewAnswerId().equals(singleInterviewFeedback.getInterview_answer_id()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("해당 interview_answer_id를 찾을 수 없습니다: " + singleInterviewFeedback.getInterview_answer_id()));

            String jsonFeedbacks;
            try {
                jsonFeedbacks = new ObjectMapper().writeValueAsString(singleInterviewFeedback.getFollow_up_questions());
            } catch (JsonProcessingException e) {
                throw new BaseException(SERIALIZATION_FAIL);
            }

            log.debug("jsonFeedbacks: {}", jsonFeedbacks);



            targetAnswer.addInterviewAnswerFeedback(singleInterviewFeedback.getFeedback());
            targetAnswer.addInterviewFollowUpQuestion(jsonFeedbacks);
            interviewAnswerRepository.save(targetAnswer);
        }

        return EndInterviewResponseDto.builder()
                .interviewVideoId(interviewVideo.getInterviewVideoId())
                .build();
    }

}
