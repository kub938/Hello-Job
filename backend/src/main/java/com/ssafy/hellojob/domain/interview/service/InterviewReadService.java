package com.ssafy.hellojob.domain.interview.service;

import com.ssafy.hellojob.domain.coverletter.entity.CoverLetter;
import com.ssafy.hellojob.domain.interview.entity.CoverLetterInterview;
import com.ssafy.hellojob.domain.interview.entity.CoverLetterQuestionBank;
import com.ssafy.hellojob.domain.interview.entity.CsQuestionBank;
import com.ssafy.hellojob.domain.interview.entity.PersonalityQuestionBank;
import com.ssafy.hellojob.domain.interview.repository.CoverLetterInterviewRepository;
import com.ssafy.hellojob.domain.interview.repository.CoverLetterQuestionBankRepository;
import com.ssafy.hellojob.domain.interview.repository.CsQuestionBankRepository;
import com.ssafy.hellojob.domain.interview.repository.PersonalityQuestionBankRepository;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import static com.ssafy.hellojob.global.exception.ErrorCode.*;

@Service
@RequiredArgsConstructor
public class InterviewReadService {

    private final CoverLetterInterviewRepository coverLetterInterviewRepository;
    private final CsQuestionBankRepository csQuestionBankRepository;
    private final PersonalityQuestionBankRepository personalityQuestionBankRepository;
    private final CoverLetterQuestionBankRepository coverLetterQuestionBankRepository;

    public CoverLetterInterview findCoverLetterInterviewByUserAndCoverLetterOrElseThrow(User user, CoverLetter coverLetter) {
        return coverLetterInterviewRepository.findByUserAndCoverLetter(coverLetter, user)
                .orElseThrow(() -> new BaseException(COVER_LETTER_INTERVIEW_NOT_FOUND));
    }

    public CsQuestionBank findCsQuestionByIdOrElseThrow(Integer csQuestionBankId) {
        return csQuestionBankRepository.findById(csQuestionBankId)
                .orElseThrow(() -> new BaseException(CS_QUESTION_NOT_FOUND));
    }

    public PersonalityQuestionBank findPersonalityQuestionByIdOrElseThrow(Integer personalityQuestionBankId) {
        return personalityQuestionBankRepository.findById(personalityQuestionBankId)
                .orElseThrow(() -> new BaseException(PERSONALITY_QUESTION_NOT_FOUND));
    }

    public CoverLetterQuestionBank findCoverLetterQuestionByIdOrElseThrow(Integer coverLetterQuestionBankId) {
        return coverLetterQuestionBankRepository.findById(coverLetterQuestionBankId)
                .orElseThrow(() -> new BaseException(COVER_LETTER_QUESTION_NOT_FOUND));
    }

}
