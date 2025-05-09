package com.ssafy.hellojob.domain.interview.service;

import com.ssafy.hellojob.domain.coverletter.entity.CoverLetter;
import com.ssafy.hellojob.domain.coverletter.repository.CoverLetterRepository;
import com.ssafy.hellojob.domain.coverletter.service.CoverLetterReadService;
import com.ssafy.hellojob.domain.interview.dto.request.WriteMemoRequestDto;
import com.ssafy.hellojob.domain.interview.dto.response.QuestionListResponseDto;
import com.ssafy.hellojob.domain.interview.dto.response.SelectInterviewStartResponseDto;
import com.ssafy.hellojob.domain.interview.dto.response.WriteMemoResponseDto;
import com.ssafy.hellojob.domain.interview.entity.*;
import com.ssafy.hellojob.domain.interview.repository.*;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.domain.user.service.UserReadService;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import static com.ssafy.hellojob.global.exception.ErrorCode.*;

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
    private final CoverLetterRepository coverLetterRepository;
    private final CoverLetterReadService coverLetterReadService;
    private final InterviewReadService interviewReadService;

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

    public List<QuestionListResponseDto> getCoverLetterQuestionList(Integer coverLetterId, Integer userId){
        User user = userReadService.findUserByIdOrElseThrow(userId);

        CoverLetter coverLetter = coverLetterRepository.findById(coverLetterId)
                .orElseThrow(() -> new BaseException(ErrorCode.COVER_LETTER_NOT_FOUND));

        CoverLetterInterview coverLetterInterview = coverLetterInterviewRepository.findByUserAndCoverLetter(coverLetter, user)
                .orElseThrow(() -> new BaseException(ErrorCode.COVER_LETTER_INTERVIEW_NOT_FOUND));

        List<CoverLetterQuestionBank> questionList = coverLetterQuestionBankRepository.findByCoverLetterInterview(coverLetterInterview);

        return questionList.stream()
                .map(q -> QuestionListResponseDto.builder()
                        .questionBankId(q.getCoverLetterQuestionBankId())
                        .question(q.getCoverLetterQuestion())
                        .build())
                .toList();
    }

    public SelectInterviewStartResponseDto startCsSelectInterview(Integer userId){
        User user = userReadService.findUserByIdOrElseThrow(userId);

        Interview interview = interviewRepository.findByUserAndCs(user, true)
                .orElseThrow(() -> new BaseException(ErrorCode.INTERVIEW_NOT_FOUND));

        InterviewVideo video = InterviewVideo.of(null, interview, true, LocalDateTime.now());
        interviewVideoRepository.save(video);

        return SelectInterviewStartResponseDto.builder()
                .interviewId(interview.getInterviewId())
                .interviewVideoId(video.getInterviewVideoId())
                .build();

    }

    public SelectInterviewStartResponseDto startPersonalitySelectInterview(Integer userId){
        User user = userReadService.findUserByIdOrElseThrow(userId);

        Interview interview = interviewRepository.findByUserAndCs(user, false)
                .orElseThrow(() -> new BaseException(ErrorCode.INTERVIEW_NOT_FOUND));

        InterviewVideo video = InterviewVideo.of(null, interview, true, LocalDateTime.now());
        interviewVideoRepository.save(video);

        return SelectInterviewStartResponseDto.builder()
                .interviewId(interview.getInterviewId())
                .interviewVideoId(video.getInterviewVideoId())
                .build();

    }

    public SelectInterviewStartResponseDto startCoverLetterSelectInterview(Integer coverLetterId, Integer userId){
        User user = userReadService.findUserByIdOrElseThrow(userId);

        CoverLetter coverLetter = coverLetterRepository.findById(coverLetterId)
                .orElseThrow(() -> new BaseException(ErrorCode.COVER_LETTER_NOT_FOUND));

        CoverLetterInterview interview = coverLetterInterviewRepository.findByUserAndCoverLetter(coverLetter, user)
                .orElseGet(() -> {
                    CoverLetterInterview newInterview = CoverLetterInterview.of(user, coverLetter); // 팩토리 메서드 예시
                    return coverLetterInterviewRepository.save(newInterview);
                });


        InterviewVideo video = InterviewVideo.of(interview, null, true, LocalDateTime.now());
        interviewVideoRepository.save(video);

        return SelectInterviewStartResponseDto.builder()
                .interviewId(interview.getCoverLettterInterviewId())
                .interviewVideoId(video.getInterviewVideoId())
                .build();

    }

    public WriteMemoResponseDto createMemo(WriteMemoRequestDto requestDto, Integer userId) {

        User user = userReadService.findUserByIdOrElseThrow(userId);
        CsQuestionBank csQuestionBank = null;
        PersonalityQuestionBank personalityQuestionBank = null;
        CoverLetterQuestionBank coverLetterQuestionBank = null;
        CoverLetterInterview coverLetterInterview = null;
        CoverLetter coverLetter = null;

        if(requestDto.getCsQuestionBankId() != null) {
            csQuestionBank = interviewReadService.findCsQuestionByIdOrElseThrow(requestDto.getCsQuestionBankId());
        } else if(requestDto.getPersonalityQuestionBankId() != null) {
            personalityQuestionBank = interviewReadService.findPersonalityQuestionByIdOrElseThrow(requestDto.getPersonalityQuestionBankId());
        } else if(requestDto.getCoverLetterQuestionBankId() != null) {
            coverLetterQuestionBank = interviewReadService.findCoverLetterQuestionByIdOrElseThrow(requestDto.getCoverLetterQuestionBankId());
            coverLetter = coverLetterReadService.findCoverLetterByIdOrElseThrow(requestDto.getCoverLetterId());
            coverLetterInterview = interviewReadService.findCoverLetterInterviewByUserAndCoverLetterOrElseThrow(user, coverLetter);
        } else {
            throw new BaseException(QUESTION_TYPE_REQUIRED);
        }

        InterviewQuestionMemo memo = InterviewQuestionMemo.builder()
                .user(user)
                .csQuestionBank(csQuestionBank)
                .personalityQuestionBank(personalityQuestionBank)
                .coverLetterQuestionBank(coverLetterQuestionBank)
                .memo(requestDto.getMemo())
                .build();

        interviewQuestionMemoRepository.save(memo);

        return WriteMemoResponseDto.from(memo.getInterviewQuestionMemoId());
    }



}
