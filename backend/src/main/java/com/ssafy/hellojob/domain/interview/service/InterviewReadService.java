package com.ssafy.hellojob.domain.interview.service;

import com.ssafy.hellojob.domain.coverletter.entity.CoverLetter;
import com.ssafy.hellojob.domain.interview.entity.*;
import com.ssafy.hellojob.domain.interview.repository.*;
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
    private final InterviewQuestionMemoRepository interviewQuestionMemoRepository;

    public CoverLetterInterview findCoverLetterInterviewByUserAndCoverLetterOrElseThrow(User user, CoverLetter coverLetter) {
        return coverLetterInterviewRepository.findByUserAndCoverLetter(user, coverLetter)
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

    public CoverLetterQuestionBank findCoverLetterQuestionByIdWithCoverLetterOrElseThrow(Integer coverLetterQuestionBankId) {
        return coverLetterQuestionBankRepository.findByIdWithCoverLetterInterview(coverLetterQuestionBankId)
                .orElseThrow(() -> new BaseException(COVER_LETTER_QUESTION_NOT_FOUND));
    }

    public InterviewQuestionMemo findInterviewQuestionMemoWithUserByIdOrElseThrow(Integer interviewQuestionMemoId) {
        return interviewQuestionMemoRepository.findByIdWithUser(interviewQuestionMemoId)
                .orElseThrow(() -> new BaseException(INTERVIEW_QUESTION_MEMO_NOT_FOUND));
    }

    public InterviewQuestionMemo findInterviewQuestionMemoByUserAndCsQuestionOrElseReturnNull(User user, CsQuestionBank csQuestionBank) {
        return interviewQuestionMemoRepository.findByUserAndCsQuestionBank(user, csQuestionBank)
                .orElse(null);
    }

    public InterviewQuestionMemo findInterviewQuestionMemoByUserAndPersonalityQuestionOrElseReturnNull(User user, PersonalityQuestionBank personalityQuestionBank) {
        return interviewQuestionMemoRepository.findByUserAndPersonalityQuestionBank(user, personalityQuestionBank)
                .orElse(null);
    }

    public InterviewQuestionMemo findInterviewQuestionMemoByUserAndCoverLetterQuestionOrElseReturnNull(User user, CoverLetterQuestionBank coverLetterQuestionBank) {
        return interviewQuestionMemoRepository.findByUserAndCoverLetterQuestionBank(user, coverLetterQuestionBank)
                .orElse(null);
    }

    public CoverLetterInterview findCoverLetterInterviewByIWithUserdOrElseThrow(Integer coverLetterInterviewId) {
        return coverLetterInterviewRepository.findByIdWithUser(coverLetterInterviewId)
                .orElseThrow(() -> new BaseException(COVER_LETTER_INTERVIEW_NOT_FOUND));
    }

}
