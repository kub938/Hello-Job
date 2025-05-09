package com.ssafy.hellojob.domain.interview.service;

import com.ssafy.hellojob.domain.interview.dto.response.QuestionListResponseDto;
import com.ssafy.hellojob.domain.interview.entity.CoverLetterInterview;
import com.ssafy.hellojob.domain.interview.entity.CoverLetterQuestionBank;
import com.ssafy.hellojob.domain.interview.entity.CsQuestionBank;
import com.ssafy.hellojob.domain.interview.entity.PersonalityQuestionBank;
import com.ssafy.hellojob.domain.interview.repository.*;
import com.ssafy.hellojob.domain.user.service.UserReadService;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final CoverLetterInterviewRepository coverLetterInterviewRepository;
    private final CoverLetterQuestionBankRepository coverLetterQuestionBankRepository;
    private final CsQuestionBankRepository csQuestionBankRepository;
    private final InterviewAnswerRepository interviewAnswerRepository;
    private final InterviewQuestionMemoRepository interviewQuestionMemoRepository;
    private final InterviewVideoRepository interviewVideoRepository;
    private final PersonalityQuestionBankRepository personalityQuestionBankRepository;

    private final UserReadService userReadService;

    public List<QuestionListResponseDto> getCsQuestionList(Integer userId){
        userReadService.findUserByIdOrElseThrow(userId);

        List<CsQuestionBank> questionList = csQuestionBankRepository.findAll();

        return questionList.stream()
                .map(q -> QuestionListResponseDto.builder()
                        .questionBankId(q.getCsQuestionBankId())
                        .question(q.getCsQuestion())
                        .build())
                .toList();
    }

    public List<QuestionListResponseDto> getPersonalityQuestionList(Integer userId){
        userReadService.findUserByIdOrElseThrow(userId);

        List<PersonalityQuestionBank> questionList = personalityQuestionBankRepository.findAll();

        return questionList.stream()
                .map(q -> QuestionListResponseDto.builder()
                        .questionBankId(q.getPersonalityQuestionBankId())
                        .question(q.getPersonalityQuestion())
                        .build())
                .toList();
    }

    public List<QuestionListResponseDto> getCoverLetterQuestionList(Integer coverLetterInterviewId, Integer userId){
        userReadService.findUserByIdOrElseThrow(userId);

        CoverLetterInterview coverLetterInterview = coverLetterInterviewRepository.findById(coverLetterInterviewId)
                .orElseThrow(() -> new BaseException(ErrorCode.COVER_LETTER_INTERVIEW_NOT_FOUND));

        List<CoverLetterQuestionBank> questionList = coverLetterQuestionBankRepository.findByCoverLetterInterview(coverLetterInterview);

        return questionList.stream()
                .map(q -> QuestionListResponseDto.builder()
                        .questionBankId(q.getCoverLetterQuestionBankId())
                        .question(q.getCoverLetterQuestion())
                        .build())
                .toList();
    }

}
