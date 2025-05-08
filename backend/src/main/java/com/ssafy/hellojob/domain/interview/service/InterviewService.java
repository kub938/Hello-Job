package com.ssafy.hellojob.domain.interview.service;

import com.ssafy.hellojob.domain.interview.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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

}
