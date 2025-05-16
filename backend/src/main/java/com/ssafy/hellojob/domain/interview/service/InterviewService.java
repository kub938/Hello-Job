package com.ssafy.hellojob.domain.interview.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.hellojob.domain.coverletter.entity.CoverLetter;
import com.ssafy.hellojob.domain.coverletter.repository.CoverLetterRepository;
import com.ssafy.hellojob.domain.coverletter.service.CoverLetterReadService;
import com.ssafy.hellojob.domain.coverlettercontent.dto.response.CoverLetterOnlyContentDto;
import com.ssafy.hellojob.domain.coverlettercontent.repository.CoverLetterExperienceRepository;
import com.ssafy.hellojob.domain.coverlettercontent.service.CoverLetterContentService;
import com.ssafy.hellojob.domain.exprience.entity.Experience;
import com.ssafy.hellojob.domain.exprience.service.ExperienceReadService;
import com.ssafy.hellojob.domain.interview.dto.request.*;
import com.ssafy.hellojob.domain.interview.dto.response.*;
import com.ssafy.hellojob.domain.interview.entity.*;
import com.ssafy.hellojob.domain.interview.repository.*;
import com.ssafy.hellojob.domain.project.entity.Project;
import com.ssafy.hellojob.domain.project.service.ProjectReadService;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.domain.user.service.UserReadService;
import com.ssafy.hellojob.global.common.client.FastApiClientService;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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
    private final CoverLetterExperienceRepository coverLetterExperienceRepository;
    private final ExperienceReadService experienceReadService;
    private final ProjectReadService projectReadService;
    private final InterviewReadService interviewReadService;
    private final CoverLetterReadService coverLetterReadService;
    private final UserReadService userReadService;
    private final CoverLetterContentService coverLetterContentService;
    private final FastApiClientService fastApiClientService;

    // polling 전 정의
    private static final int MAX_WAIT_SECONDS = 60;
    private static final int POLL_INTERVAL_MS = 500;

    private static final Integer QUESTION_SIZE = 5;

    @Value("${FFPROBE_PATH}")
    private static String ffprobe_path;

    @Value("${OPENAI_API_URL}")
    private static String openAiUrl;

    @Value("${OPENAI_API_KEY}")
    private static String openAiKey;
    private final S3UploadService s3UploadService;

    // cs 질문 목록 조회
    public List<QuestionListResponseDto> getCsQuestionList(Integer userId) {
        userReadService.findUserByIdOrElseThrow(userId);
        List<CsQuestionBank> questionList = csQuestionBankRepository.findAll();

        return questionList.stream()
                .map(q -> QuestionListResponseDto.builder()
                        .questionBankId(q.getCsQuestionBankId())
                        .question(q.getCsQuestion())
                        .build())
                .toList();
    }

    public QuestionDetailResponseDto findCsQuestionDetail(Integer questionId, Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);
        CsQuestionBank questionBank = csQuestionBankRepository.findById(questionId)
                .orElseThrow(() -> new BaseException(QUESTION_NOT_FOUND));

        InterviewQuestionMemo memo = interviewReadService.findInterviewQuestionMemoByUserAndCsQuestionOrElseReturnNull(user, questionBank);
        if (memo == null) throw new BaseException(INTERVIEW_QUESTION_MEMO_NOT_FOUND);

        return QuestionDetailResponseDto.builder()
                .questionBankId(questionId)
                .question(questionBank.getCsQuestion())
                .memo(memo.getMemo())
                .build();
    }

    // 인성 질문 목록 조회
    public List<QuestionListResponseDto> getPersonalityQuestionList(Integer userId) {
        userReadService.findUserByIdOrElseThrow(userId);
        List<PersonalityQuestionBank> questionList = personalityQuestionBankRepository.findAll();

        return questionList.stream()
                .map(q -> QuestionListResponseDto.builder()
                        .questionBankId(q.getPersonalityQuestionBankId())
                        .question(q.getPersonalityQuestion())
                        .build())
                .toList();
    }

    public QuestionDetailResponseDto findPersonalityQuestionDetail(Integer questionId, Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);
        PersonalityQuestionBank questionBank = personalityQuestionBankRepository.findById(questionId)
                .orElseThrow(() -> new BaseException(QUESTION_NOT_FOUND));

        InterviewQuestionMemo memo = interviewReadService.findInterviewQuestionMemoByUserAndPersonalityQuestionOrElseReturnNull(user, questionBank);
        if (memo == null) throw new BaseException(INTERVIEW_QUESTION_MEMO_NOT_FOUND);

        return QuestionDetailResponseDto.builder()
                .questionBankId(questionId)
                .question(questionBank.getPersonalityQuestion())
                .memo(memo.getMemo())
                .build();
    }

    // 자소서 기반 질문 목록 조회
    public List<QuestionListResponseDto> getCoverLetterQuestionList(Integer coverLetterId, Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);
        CoverLetter coverLetter = coverLetterReadService.findCoverLetterByIdOrElseThrow(coverLetterId);

        if (!userId.equals(coverLetter.getUser().getUserId())) {
            throw new BaseException(INVALID_USER);
        }

        CoverLetterInterview coverLetterInterview = coverLetterInterviewRepository.findByCoverLetter(coverLetter)
                .orElseGet(() -> {
                    CoverLetterInterview newCoverLetterInterview = CoverLetterInterview.of(user, coverLetter);
                    return coverLetterInterviewRepository.save(newCoverLetterInterview);
                });


        // 자소서 질문 조회
        List<CoverLetterQuestionBank> questionList = coverLetterQuestionBankRepository.findByCoverLetterInterview(coverLetterInterview);

        return questionList.stream()
                .map(q -> QuestionListResponseDto.builder()
                        .questionBankId(q.getCoverLetterQuestionBankId())
                        .question(q.getCoverLetterQuestion())
                        .build())
                .toList();
    }

    public QuestionDetailResponseDto findCoverLetterQuestionDetail(Integer questionId, Integer coverLetterId, Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);


        CoverLetterInterview coverLetterInterview = coverLetterInterviewRepository.findByUserAndCoverLetterIdWithGraph(user, coverLetterId)
                .orElseThrow(() -> new BaseException(COVER_LETTER_INTERVIEW_NOT_FOUND));

        CoverLetterQuestionBank questionBank = coverLetterQuestionBankRepository.findByIdWithCoverLetterInterview(questionId)
                .orElseThrow(() -> new BaseException(QUESTION_NOT_FOUND));

        if (!questionBank.getCoverLetterInterview().equals(coverLetterInterview))
            throw new BaseException(COVER_LETTER_QUESTION_MISMATCH);

        InterviewQuestionMemo memo = interviewReadService.findInterviewQuestionMemoByUserAndCoverLetterQuestionOrElseReturnNull(user, questionBank);
        if (memo == null) throw new BaseException(INTERVIEW_QUESTION_MEMO_NOT_FOUND);

        return QuestionDetailResponseDto.builder()
                .questionBankId(questionId)
                .question(questionBank.getCoverLetterQuestion())
                .memo(memo.getMemo())
                .build();
    }

    // 문항 카테고리 선택 cs
    public SelectInterviewStartResponseDto startCsSelectInterview(Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);

        // 면접이 없을 때(처음 시도하는 유저인 경우)
        Interview interview = interviewRepository.findByUserAndCs(user, true)
                .orElseGet(() -> {
                    Interview newInterview = Interview.of(user, true);
                    return interviewRepository.save(newInterview);
                });

        // 면접 영상 생성
        InterviewVideo video = InterviewVideo.of(null, interview, true, LocalDateTime.now(), InterviewCategory.valueOf("CS"));
        interviewVideoRepository.save(video);

        return SelectInterviewStartResponseDto.builder()
                .interviewId(interview.getInterviewId())
                .interviewVideoId(video.getInterviewVideoId())
                .build();

    }

    // 문항 카테고리 선택 인성
    public SelectInterviewStartResponseDto startPersonalitySelectInterview(Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);

        // 면접이 없을 때(처음 시도하는 유저인 경우)
        Interview interview = interviewRepository.findByUserAndCs(user, false)
                .orElseGet(() -> {
                    Interview newInterview = Interview.of(user, false);
                    return interviewRepository.save(newInterview);
                });

        // 면접 영상 생성
        InterviewVideo video = InterviewVideo.of(null, interview, true, LocalDateTime.now(), InterviewCategory.valueOf("PERSONALITY"));
        interviewVideoRepository.save(video);

        return SelectInterviewStartResponseDto.builder()
                .interviewId(interview.getInterviewId())
                .interviewVideoId(video.getInterviewVideoId())
                .build();

    }

    // 구현 폐기
    public SelectInterviewStartResponseDto startCoverLetterSelectInterview(Integer coverLetterId, Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);

        CoverLetter coverLetter = coverLetterRepository.findById(coverLetterId)
                .orElseThrow(() -> new BaseException(ErrorCode.COVER_LETTER_NOT_FOUND));

        CoverLetterInterview interview = coverLetterInterviewRepository.findByUserAndCoverLetter(user, coverLetter)
                .orElseGet(() -> {
                    CoverLetterInterview newInterview = CoverLetterInterview.of(user, coverLetter); // 팩토리 메서드 예시
                    return coverLetterInterviewRepository.save(newInterview);
                });


        InterviewVideo video = InterviewVideo.of(interview, null, true, LocalDateTime.now(), InterviewCategory.valueOf("COVERLETTER"));
        interviewVideoRepository.save(video);

        return SelectInterviewStartResponseDto.builder()
                .interviewId(interview.getCoverLetterInterviewId())
                .interviewVideoId(video.getInterviewVideoId())
                .build();

    }

    // cs 모의 면접 시작
    public InterviewStartResponseDto startCsRandomInterview(Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);

        // 면접이 없을 때(처음 시도하는 유저)
        Interview interview = interviewRepository.findByUserAndCs(user, true)
                .orElseGet(() -> {
                    Interview newInterview = Interview.of(user, true);
                    return interviewRepository.save(newInterview);
                });

        // 면접 영상 생성
        InterviewVideo video = InterviewVideo.of(null, interview, true, LocalDateTime.now(), InterviewCategory.valueOf("CS"));
        interviewVideoRepository.save(video);

        // cs 질문 랜덤하게 가져오기
        List<CsQuestionBank> all = csQuestionBankRepository.findAll();
        Collections.shuffle(all); // Java 내부에서 무작위 섞기
        List<CsQuestionBank> selectedQuestion = all.stream()
                .limit(QUESTION_SIZE)
                .toList();

        List<QuestionAndAnswerListResponseDto> questionList = selectedQuestion.stream()
                .map(q -> {
                    InterviewAnswer answer = InterviewAnswer.of(video, q.getCsQuestion(), InterviewQuestionCategory.valueOf(q.getCsCategory().name()));
                    interviewAnswerRepository.save(answer);

                    return QuestionAndAnswerListResponseDto.builder()
                            .questionBankId(q.getCsQuestionBankId())
                            .interviewAnswerId(answer.getInterviewAnswerId())
                            .question(q.getCsQuestion())
                            .build();
                })
                .toList();

        return InterviewStartResponseDto.builder()
                .interviewId(interview.getInterviewId())
                .interviewVideoId(video.getInterviewVideoId())
                .questionList(questionList)
                .build();

    }

    // 인성 모의 면접 시작
    public InterviewStartResponseDto startPersonalityRandomInterview(Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);

        // 면접이 없을 때(처음 시도하는 유저인 경우)
        Interview interview = interviewRepository.findByUserAndCs(user, true)
                .orElseGet(() -> {
                    Interview newInterview = Interview.of(user, true);
                    return interviewRepository.save(newInterview);
                });

        // 면접 영상 생성
        InterviewVideo video = InterviewVideo.of(null, interview, true, LocalDateTime.now(), InterviewCategory.valueOf("PERSONALITY"));
        interviewVideoRepository.save(video);

        // 인성 질문 랜덤하게 가져오기
        List<PersonalityQuestionBank> all = personalityQuestionBankRepository.findAll();
        Collections.shuffle(all); // Java 내부에서 무작위 섞기
        List<PersonalityQuestionBank> selectedQuestion = all.stream()
                .limit(QUESTION_SIZE)
                .toList();

        List<QuestionAndAnswerListResponseDto> questionList = selectedQuestion.stream()
                .map(q -> {
                    InterviewAnswer answer = InterviewAnswer.of(video, q.getPersonalityQuestion(), InterviewQuestionCategory.valueOf("인성면접"));
                    interviewAnswerRepository.save(answer);

                    return QuestionAndAnswerListResponseDto.builder()
                            .questionBankId(q.getPersonalityQuestionBankId())
                            .interviewAnswerId(answer.getInterviewAnswerId())
                            .question(q.getPersonalityQuestion())
                            .build();
                })
                .toList();

        return InterviewStartResponseDto.builder()
                .interviewId(interview.getInterviewId())
                .interviewVideoId(video.getInterviewVideoId())
                .questionList(questionList)
                .build();

    }

    // 자소서 모의 면접 시작
    public InterviewStartResponseDto startCoverLetterRandomInterview(Integer coverLetterId, Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);
        CoverLetter coverLetter = coverLetterReadService.findCoverLetterByIdOrElseThrow(coverLetterId);

        if (!userId.equals(coverLetter.getUser().getUserId())) {
            throw new BaseException(INVALID_USER);
        }

        // 면접이 없을 경우(처음 시도한느 유저)
        CoverLetterInterview interview = coverLetterInterviewRepository.findByUserAndCoverLetter(user, coverLetter)
                .orElseGet(() -> {
                    CoverLetterInterview newInterview = CoverLetterInterview.of(user, coverLetter); 
                    return coverLetterInterviewRepository.save(newInterview);
                });

        // 면접 영상 생성
        InterviewVideo video = InterviewVideo.of(interview, null, true, LocalDateTime.now(), InterviewCategory.valueOf("COVERLETTER"));
        interviewVideoRepository.save(video);

        // 질문 랜덤하게 가져오기
        List<CoverLetterQuestionBank> all = coverLetterQuestionBankRepository.findByCoverLetterInterview(interview);
        Collections.shuffle(all); // Java 내부에서 무작위 섞기
        List<CoverLetterQuestionBank> selectedQuestion = all.stream()
                .limit(QUESTION_SIZE)
                .toList();

        List<QuestionAndAnswerListResponseDto> questionList = selectedQuestion.stream()
                .map(q -> {
                    InterviewAnswer answer = InterviewAnswer.of(video, q.getCoverLetterQuestion(), InterviewQuestionCategory.valueOf("자기소개서면접"));
                    interviewAnswerRepository.save(answer);

                    return QuestionAndAnswerListResponseDto.builder()
                            .questionBankId(q.getCoverLetterQuestionBankId())
                            .interviewAnswerId(answer.getInterviewAnswerId())
                            .question(q.getCoverLetterQuestion())
                            .build();
                })
                .toList();

        return InterviewStartResponseDto.builder()
                .interviewId(interview.getCoverLetterInterviewId())
                .interviewVideoId(video.getInterviewVideoId())
                .questionList(questionList)
                .build();

    }

    // 문항 선택 면접 cs 질문 선택
    public InterviewStartResponseDto saveCsQuestions(Integer userId, SelectQuestionRequestDto requestDto) {
        userReadService.findUserByIdOrElseThrow(userId);

        InterviewVideo video = interviewReadService.findInterviewVideoByIdOrElseThrow(requestDto.getInterviewVideoId());

        Interview interview = interviewReadService.findInterviewById(video.getInterview().getInterviewId());
        if (!userId.equals(interview.getUser().getUserId())) {
            throw new BaseException(INVALID_USER);
        }

        List<QuestionAndAnswerListResponseDto> questionList = new ArrayList<>();

        // front에서 받은 질문 id로 질문(string) 조회 후 interviewAnswer 객체 생성
        for (Integer questionId : requestDto.getQuestionIdList()) {

            CsQuestionBank question = csQuestionBankRepository.findById(questionId)
                    .orElseThrow(() -> new BaseException(ErrorCode.QUESTION_NOT_FOUND));

            InterviewAnswer answer = InterviewAnswer.of(
                    video,
                    question.getCsQuestion(),
                    InterviewQuestionCategory.valueOf(question.getCsCategory().name())
            );
            interviewAnswerRepository.save(answer);

            questionList.add(
                    QuestionAndAnswerListResponseDto.builder()
                            .questionBankId(questionId)
                            .question(question.getCsQuestion())
                            .interviewAnswerId(answer.getInterviewAnswerId())
                            .build()
            );
        }

        return InterviewStartResponseDto.builder()
                .interviewId(video.getInterviewVideoId())
                .interviewVideoId(video.getInterviewVideoId())
                .questionList(questionList)
                .build();
    }

    // 문항 선택 면접 인성 질문 선택
    public InterviewStartResponseDto savePersonalityQuestions(Integer userId, SelectQuestionRequestDto requestDto) {
        userReadService.findUserByIdOrElseThrow(userId);

        InterviewVideo video = interviewReadService.findInterviewVideoByIdOrElseThrow(requestDto.getInterviewVideoId());

        Interview interview = interviewReadService.findInterviewById(video.getInterview().getInterviewId());
        if (!userId.equals(interview.getUser().getUserId())) {
            throw new BaseException(INVALID_USER);
        }

        List<QuestionAndAnswerListResponseDto> questionList = new ArrayList<>();

        // front에서 받은 질문 id로 질문(string) 조회 후 interviewAnswer 객체 생성
        for (Integer questionId : requestDto.getQuestionIdList()) {

            PersonalityQuestionBank question = personalityQuestionBankRepository.findById(questionId)
                    .orElseThrow(() -> new BaseException(ErrorCode.QUESTION_NOT_FOUND));

            InterviewAnswer answer = InterviewAnswer.of(
                    video,
                    question.getPersonalityQuestion(),
                    InterviewQuestionCategory.valueOf("인성면접")
            );
            interviewAnswerRepository.save(answer);

            questionList.add(
                    QuestionAndAnswerListResponseDto.builder()
                            .questionBankId(questionId)
                            .question(question.getPersonalityQuestion())
                            .interviewAnswerId(answer.getInterviewAnswerId())
                            .build()
            );
        }

        return InterviewStartResponseDto.builder()
                .interviewId(video.getInterviewVideoId())
                .interviewVideoId(video.getInterviewVideoId())
                .questionList(questionList)
                .build();

    }

    // 문항 선택 면접 자소서 질문 선택
    public InterviewStartResponseDto saveCoverLetterQuestions(Integer userId, SelectCoverLetterQuestionRequestDto requestDto) {
        userReadService.findUserByIdOrElseThrow(userId);
        CoverLetter coverLetter = coverLetterReadService.findCoverLetterByIdOrElseThrow(requestDto.getCoverLetterId());
        if (!userId.equals(coverLetter.getUser().getUserId())) {
            throw new BaseException(INVALID_USER);
        }
        CoverLetterInterview coverLetterInterview = interviewReadService.findCoverLetterInterviewByCoverLetter(coverLetter);

        InterviewVideo video = interviewVideoRepository.save(InterviewVideo.of(coverLetterInterview, null, true, LocalDateTime.now(), InterviewCategory.valueOf("COVERLETTER")));

        List<QuestionAndAnswerListResponseDto> questionList = new ArrayList<>();

        for (Integer questionId : requestDto.getQuestionIdList()) {

            // front에서 받은 질문 id로 질문(string) 조회 후 interviewAnswer 객체 생성
            CoverLetterQuestionBank question = coverLetterQuestionBankRepository.findById(questionId)
                    .orElseThrow(() -> new BaseException(ErrorCode.QUESTION_NOT_FOUND));

            InterviewAnswer answer = InterviewAnswer.of(
                    video,
                    question.getCoverLetterQuestion(),
                    InterviewQuestionCategory.valueOf("자기소개서면접")
            );
            interviewAnswerRepository.save(answer);

            questionList.add(
                    QuestionAndAnswerListResponseDto.builder()
                            .questionBankId(questionId)
                            .question(question.getCoverLetterQuestion())
                            .interviewAnswerId(answer.getInterviewAnswerId())
                            .build()
            );
        }

        return InterviewStartResponseDto.builder()
                .interviewId(video.getInterviewVideoId())
                .interviewVideoId(video.getInterviewVideoId())
                .questionList(questionList)
                .build();

    }

    // 자소서 기반으로 생성된 질문 저장
    public Map<String, String> saveNewCoverLetterQuestion(Integer userId, CoverLetterQuestionSaveRequestDto requestDto) {
        User user = userReadService.findUserByIdOrElseThrow(userId);
        CoverLetter coverLetter = coverLetterReadService.findCoverLetterByIdOrElseThrow(requestDto.getCoverLetterId());

        if (!userId.equals(coverLetter.getUser().getUserId())) {
            throw new BaseException(INVALID_USER);
        }

        // 면접 었을 시 생성
        CoverLetterInterview coverLetterInterview = coverLetterInterviewRepository.findByCoverLetter(coverLetter)
                .orElseGet(() -> {
                    CoverLetterInterview newInterview = CoverLetterInterview.of(user, coverLetter);
                    return coverLetterInterviewRepository.save(newInterview);
                });

        List<CoverLetterQuestionIdDto> questionIdList = new ArrayList<>();

        for (String newQuestion : requestDto.getCoverLetterQuestion()) {

            CoverLetterQuestionBank newQuestions = CoverLetterQuestionBank.of(coverLetterInterview, newQuestion);
            coverLetterQuestionBankRepository.save(newQuestions);
            questionIdList.add(CoverLetterQuestionIdDto.builder()
                    .coverLetterQuestionBankId(newQuestions.getCoverLetterQuestionBankId())
                    .build());
        }

        return Map.of("message", "성공적으로 저장되었습니다.");
    }

    public WriteMemoResponseDto createCsMemo(WriteMemoRequestDto requestDto, Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);
        CsQuestionBank csQuestionBank = interviewReadService.findCsQuestionByIdOrElseThrow(requestDto.getQuestionBankId());
        InterviewQuestionMemo memo = interviewReadService.findInterviewQuestionMemoByUserAndCsQuestionOrElseReturnNull(user, csQuestionBank);

        if (memo != null) {
            memo.updateMemo(requestDto.getMemo());
        } else {
            memo = InterviewQuestionMemo.builder()
                    .user(user)
                    .csQuestionBank(csQuestionBank)
                    .personalityQuestionBank(null)
                    .coverLetterQuestionBank(null)
                    .memo(requestDto.getMemo())
                    .build();
        }

        interviewQuestionMemoRepository.save(memo);

        return WriteMemoResponseDto.from(memo.getInterviewQuestionMemoId());

    }

    public WriteMemoResponseDto createPersonalityMemo(WriteMemoRequestDto requestDto, Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);
        PersonalityQuestionBank personalityQuestionBank = interviewReadService.findPersonalityQuestionByIdOrElseThrow(requestDto.getQuestionBankId());
        InterviewQuestionMemo memo = interviewReadService.findInterviewQuestionMemoByUserAndPersonalityQuestionOrElseReturnNull(user, personalityQuestionBank);

        if (memo != null) {
            memo.updateMemo(requestDto.getMemo());
        } else {
            memo = InterviewQuestionMemo.builder()
                    .user(user)
                    .csQuestionBank(null)
                    .personalityQuestionBank(personalityQuestionBank)
                    .coverLetterQuestionBank(null)
                    .memo(requestDto.getMemo())
                    .build();
        }

        interviewQuestionMemoRepository.save(memo);

        return WriteMemoResponseDto.from(memo.getInterviewQuestionMemoId());
    }

    public WriteMemoResponseDto createCoverLetterMemo(WriteMemoRequestDto requestDto, Integer coverLetterId, Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);
        CoverLetterQuestionBank coverLetterQuestionBank = interviewReadService.findCoverLetterQuestionByIdWithCoverLetterOrElseThrow(requestDto.getQuestionBankId());
        CoverLetter coverLetter = coverLetterReadService.findCoverLetterByIdOrElseThrow(coverLetterId);
        CoverLetterInterview coverLetterInterview = interviewReadService.findCoverLetterInterviewByUserAndCoverLetterOrElseThrow(user, coverLetter);

        if (!coverLetterInterview.equals(coverLetterQuestionBank.getCoverLetterInterview())) {
            throw new BaseException(COVER_LETTER_QUESTION_MISMATCH);
        }

        InterviewQuestionMemo memo = interviewReadService.findInterviewQuestionMemoByUserAndCoverLetterQuestionOrElseReturnNull(user, coverLetterQuestionBank);

        if (memo != null) {
            memo.updateMemo(requestDto.getMemo());
        } else {
            memo = InterviewQuestionMemo.builder()
                    .user(user)
                    .csQuestionBank(null)
                    .personalityQuestionBank(null)
                    .coverLetterQuestionBank(coverLetterQuestionBank)
                    .memo(requestDto.getMemo())
                    .build();
        }

        interviewQuestionMemoRepository.save(memo);

        return WriteMemoResponseDto.from(memo.getInterviewQuestionMemoId());
    }

    public Map<String, String> updateMemo(String newMemo, Integer memoId, Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);
        InterviewQuestionMemo memo = interviewReadService.findInterviewQuestionMemoWithUserByIdOrElseThrow(memoId);

        if (!memo.getUser().equals(user)) {
            throw new BaseException(INTERVIEW_QUESTION_MEMO_MISMATCH);
        }

        memo.updateMemo(newMemo);
        interviewQuestionMemoRepository.save(memo);
        return Map.of("message", "성공적으로 수정되었습니다.");
    }

    public Map<String, String> deleteMemo(Integer memoId, Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);
        InterviewQuestionMemo memo = interviewReadService.findInterviewQuestionMemoWithUserByIdOrElseThrow(memoId);

        if (!memo.getUser().equals(user)) {
            throw new BaseException(INTERVIEW_QUESTION_MEMO_MISMATCH);
        }

        interviewQuestionMemoRepository.delete(memo);
        return Map.of("message", "메모가 삭제되었습니다.");
    }

    // stt
    public String transcribeAudio(MultipartFile audioFile) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            // 파일 리소스로 변환
            Resource audioResource = new ByteArrayResource(audioFile.getBytes()) {
                @Override
                public String getFilename() {
                    return audioFile.getOriginalFilename();
                }
            };

            // Form 데이터 생성
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", audioResource);
            body.add("model", "whisper-1");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.setBearerAuth(openAiKey);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    openAiUrl,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            // text만 추출
            if (response.getStatusCode().is2xxSuccessful()) {
                ObjectMapper objectMapper = new ObjectMapper();
                return objectMapper.readTree(response.getBody()).get("text").asText();
            } else {
                return "stt 변환에 실패했습니다";
            }
        } catch (Exception e) {
            return "stt 변환에 실패했습니다";
        }
    }


    // 한 문항 종료(면접 답변 저장)
    @Transactional
    public Map<String, String> saveInterviewAnswer(Integer userId, String url, String answer, Integer interviewAnswerId, MultipartFile videoFile) {
        userReadService.findUserByIdOrElseThrow(userId);

        InterviewAnswer interviewAnswer = interviewReadService.findInterviewAnswerByIdOrElseThrow(interviewAnswerId);
        InterviewVideo interviewVideo = interviewReadService.findInterviewVideoByIdOrElseThrow(interviewAnswer.getInterviewVideo().getInterviewVideoId());

        if (interviewAnswer.getInterviewQuestionCategory().name().equals("자기소개서면접")) {
            CoverLetterInterview coverLetterInterview = interviewReadService.findCoverLetterInterviewById(interviewVideo.getCoverLetterInterview().getCoverLetterInterviewId());
            if (!userId.equals(coverLetterInterview.getUser().getUserId())) {
                throw new BaseException(INVALID_USER);
            }
        } else {
            Interview interview = interviewReadService.findInterviewById(interviewVideo.getInterview().getInterviewId());
            if (!userId.equals(interview.getUser().getUserId())) {
                throw new BaseException(INVALID_USER);
            }
        }

        String videoLength = null;
        try {
            videoLength = getVideoDurationWithFFprobe(videoFile);
        } catch (Exception e) {
            throw new BaseException(GET_VIDEO_LENGTH_FAIL);
        }

        interviewAnswer.addInterviewAnswer(answer);
        interviewAnswer.addInterviewVideoUrl(url);
        interviewAnswer.addVideoLength(videoLength);

        return Map.of("message", "정상적으로 저장되었습니다.");
    }

    // 동영상에서 시간 뽑아내기
    public String getVideoDurationWithFFprobe(MultipartFile videoFile) throws IOException, InterruptedException {
        File tempFile = File.createTempFile("upload", ".mp4");
        videoFile.transferTo(tempFile);

        ProcessBuilder pb = new ProcessBuilder(
                ffprobe_path,
                "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                tempFile.getAbsolutePath()
        );

        Process process = pb.start();
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String durationStr = reader.readLine();
        process.waitFor();

        try {
            Files.delete(tempFile.toPath());
        } catch (IOException e) {
            log.error("⚠️ 임시 파일 삭제 실패: {}", tempFile.getAbsolutePath(), e);
        }

        if (durationStr == null) {
            log.error("⚠️ ffprobe 결과가 null입니다. 영상 길이를 분석하지 못했습니다.");
            return "";
        }

        double durationInSeconds = Double.parseDouble(durationStr.trim());

        // 초 단위를 hh:mm:ss 형식으로 변환
        int hours = (int) durationInSeconds / 3600;
        int minutes = ((int) durationInSeconds % 3600) / 60;
        int seconds = (int) durationInSeconds % 60;

        return String.format("%02d:%02d:%02d", hours, minutes, seconds);
    }

    // Fast API 자소서 기반 질문 생성
    @Transactional
    public CreateCoverLetterQuestionResponseDto createCoverLetterQuestion(Integer userId, CoverLetterIdRequestDto requestDto) {
        userReadService.findUserByIdOrElseThrow(userId);
        CoverLetter coverLetter = coverLetterReadService.findCoverLetterByIdOrElseThrow(requestDto.getCoverLetterId());

        if (!userId.equals(coverLetter.getUser().getUserId())) {
            throw new BaseException(INVALID_USER);
        }

        // 자소서 내용 조회
        List<CoverLetterOnlyContentDto> coverLetterContents = coverLetterContentService.getWholeContentDetail(requestDto.getCoverLetterId());
        List<CoverLetterContentFastAPIRequestDto> coverLetterContentFastAPIRequestDto = searchCoverLetterContents(coverLetterContents);

        CoverLetterFastAPIRequestDto coverLetterFastAPIRequestDto = CoverLetterFastAPIRequestDto.builder()
                .cover_letter_id(coverLetter.getCoverLetterId())
                .cover_letter_contents(coverLetterContentFastAPIRequestDto)
                .build();

        // 경험 및 프로젝트 조회
        List<Integer> experienceIds = new ArrayList<>();
        List<Integer> projectIds = new ArrayList<>();

        for (CoverLetterOnlyContentDto content : coverLetterContents) {
            experienceIds = coverLetterExperienceRepository.findExperiencesByContentId(content.getContentId());
            projectIds = coverLetterExperienceRepository.findProjectsByContentId(content.getContentId());
        }

        List<ExperienceFastAPIRequestDto> experiences = new ArrayList<>();
        List<ProjectFastAPIRequestDto> projects = new ArrayList<>();
        if (!experienceIds.isEmpty()) {
            experiences = searchExperiencesByCoverLetterContentId(experienceIds);
        }

        if (!projects.isEmpty()) {
            projects = searchProjectsByCoverLetterContentId(projectIds);
        }

        CreateCoverLetterFastAPIRequestDto createCoverLetterFastAPIRequestDto = CreateCoverLetterFastAPIRequestDto.builder()
                .cover_letter(coverLetterFastAPIRequestDto)
                .experiences(experiences)
                .projects(projects)
                .build();

        // fast API 요청 전송
        CreateCoverLetterFastAPIResponseDto fastAPIResponseDto = fastApiClientService.sendCoverLetterToFastApi(createCoverLetterFastAPIRequestDto);

        return CreateCoverLetterQuestionResponseDto.builder()
                .coverLetterId(coverLetter.getCoverLetterId())
                .coverLetterQuestion(fastAPIResponseDto.getExpected_questions())
                .build();
    }

    // 면접 종료
    @Transactional
    public EndInterviewResponseDto endInterview(Integer userId, EndInterviewRequestDto videoInfo) throws InterruptedException {
        // 유저, 인터뷰 영상, 인터뷰 답변 객체 조회
        userReadService.findUserByIdOrElseThrow(userId);
        InterviewVideo interviewVideo = interviewReadService.findInterviewVideoByIdOrElseThrow(videoInfo.getInterviewVideoId());
        List<InterviewAnswer> interviewAnswers = interviewAnswerRepository.findInterviewAnswerByInterviewVideo(interviewVideo);

        // Polling: 최대 MAX_WAIT_SECONDS까지 대기
        int waited = 0;
        while (waited < MAX_WAIT_SECONDS * 1000) {
            boolean hasPendingStt = interviewAnswers.stream()
                    .anyMatch(ans -> ans.getInterviewAnswer() == null);

            if (!hasPendingStt) break;  // 모두 STT 완료됨

            Thread.sleep(POLL_INTERVAL_MS);  // 0.5초 대기
            waited += POLL_INTERVAL_MS;

            // 최신 상태로 다시 로드
            interviewAnswers = interviewAnswerRepository.findInterviewAnswerByInterviewVideo(interviewVideo);
        }

        // 인터뷰 유저와 요청한 유저 유효성 검사
        if (interviewVideo.getCoverLetterInterview() != null) {
            CoverLetterInterview coverLetterInterview = interviewReadService.findCoverLetterInterviewById(interviewVideo.getCoverLetterInterview().getCoverLetterInterviewId());
            if (!userId.equals(coverLetterInterview.getUser().getUserId())) {
                throw new BaseException(INVALID_USER);
            }
        } else {
            Interview interview = interviewReadService.findInterviewById(interviewVideo.getInterview().getInterviewId());
            if (!userId.equals(interview.getUser().getUserId())) {
                throw new BaseException(INVALID_USER);
            }
        }

        interviewVideo.addTitle(videoInfo.getInterviewTitle());
        interviewVideo.addEndTime(LocalDateTime.now());

        // 여기서부터 fast API 관련 로직
        // 답변 객체 조회(stt 변환에 성공한 경우만)
        List<InterviewQuestionAndAnswerRequestDto> interviewQuestionAndAnswerRequestDto =
                searchInterviewQuestionAndAnswer(interviewAnswers).stream()
                        .filter(dto -> dto.getInterview_answer() != null && !dto.getInterview_answer().equals("stt 변환에 실패했습니다"))
                        .toList();

        // 모든 항목의 답변이 stt변환에 실패했을 때
        if (interviewQuestionAndAnswerRequestDto.isEmpty()) {
            return EndInterviewResponseDto.builder()
                    .interviewVideoId(interviewVideo.getInterviewVideoId())
                    .build();
        }

        // 자소서 조회
        List<CoverLetterContentFastAPIRequestDto> coverLetterContentFastAPIRequestDto = new ArrayList<>();

        if (interviewVideo.getCoverLetterInterview() != null) {
            CoverLetterInterview coverLetterInterview = interviewReadService.findCoverLetterInterviewById(interviewVideo.getCoverLetterInterview().getCoverLetterInterviewId());
            List<CoverLetterOnlyContentDto> coverLetterContents = coverLetterContentService.getWholeContentDetail(coverLetterInterview.getCoverLetter().getCoverLetterId());
            coverLetterContentFastAPIRequestDto = searchCoverLetterContents(coverLetterContents);
        }

        // fast API 호출에 활용할 객체 생성
        InterviewFeedbackFastAPIRequestDto fastAPIRequestDto = InterviewFeedbackFastAPIRequestDto.builder()
                .interview_question_answer_pairs(interviewQuestionAndAnswerRequestDto)
                .cover_letter_contents(coverLetterContentFastAPIRequestDto)
                .build();

        // fast API 호출
        InterviewFeedbackFastAPIResponseDto fastAPIResponseDto = fastApiClientService.sendInterviewAnswerToFastApi(fastAPIRequestDto);

        // 꼬리 질문 json 직렬화
        interviewVideo.addInterviewFeedback(fastAPIResponseDto.getOverall_feedback());

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

            targetAnswer.addInterviewAnswerFeedback(singleInterviewFeedback.getFeedback());
            targetAnswer.addInterviewFollowUpQuestion(jsonFeedbacks);

        }

        return EndInterviewResponseDto.builder()
                .interviewVideoId(interviewVideo.getInterviewVideoId())
                .build();
    }

    // 면접 질문 + 답변 객체 조회
    public List<InterviewQuestionAndAnswerRequestDto> searchInterviewQuestionAndAnswer(List<InterviewAnswer> interviewAnswers) {
        List<InterviewQuestionAndAnswerRequestDto> result = new ArrayList<>();
        for (InterviewAnswer answer : interviewAnswers) {
            result.add(
                    InterviewQuestionAndAnswerRequestDto.builder()
                            .interview_answer_id(answer.getInterviewAnswerId())
                            .interview_question(answer.getInterviewQuestion())
                            .interview_answer(answer.getInterviewAnswer())
                            .interview_question_category(answer.getInterviewQuestionCategory().name())
                            .build()
            );
        }
        return result;
    }

    // fast API 요청 보낼 때 자소서 전문 조회 함수
    public List<CoverLetterContentFastAPIRequestDto> searchCoverLetterContents(List<CoverLetterOnlyContentDto> coverLetterContents) {
        List<CoverLetterContentFastAPIRequestDto> coverLetterContentFastAPIRequestDto = new ArrayList<>();
        for (CoverLetterOnlyContentDto content : coverLetterContents) {
            coverLetterContentFastAPIRequestDto.add(
                    CoverLetterContentFastAPIRequestDto.builder()
                            .cover_letter_content_number(content.getContentNumber())
                            .cover_letter_content_question(content.getContentQuestion())
                            .cover_letter_content_detail(content.getContentDetail())
                            .build()
            );
        }
        return coverLetterContentFastAPIRequestDto;
    }

    // 자소서 기반 경험 조회
    public List<ExperienceFastAPIRequestDto> searchExperiencesByCoverLetterContentId(List<Integer> experienceIds) {
        List<ExperienceFastAPIRequestDto> experiences = new ArrayList<>();
        if (!experienceIds.isEmpty()) {
            for (Integer experienceId : experienceIds) {
                Experience experience = experienceReadService.findExperienceByIdOrElseThrow(experienceId);
                experiences.add(
                        ExperienceFastAPIRequestDto.builder()
                                .experience_name(experience.getExperienceName())
                                .experience_role(experience.getExperienceRole())
                                .experience_client(experience.getExperienceClient())
                                .experience_detail(experience.getExperienceDetail())
                                .experience_start_date(experience.getExperienceStartDate())
                                .experience_end_date(experience.getExperienceEndDate())
                                .build()
                );
            }
        }
        return experiences;
    }

    // 자소서 기반 경험 조회
    public List<ProjectFastAPIRequestDto> searchProjectsByCoverLetterContentId(List<Integer> projectIds) {
        List<ProjectFastAPIRequestDto> projects = new ArrayList<>();
        for (Integer projectId : projectIds) {
            Project project = projectReadService.findProjectByIdOrElseThrow(projectId);
            projects.add(
                    ProjectFastAPIRequestDto.builder()
                            .project_name(project.getProjectName())
                            .project_role(project.getProjectRole())
                            .project_skills(project.getProjectSkills())
                            .project_client(project.getProjectClient())
                            .project_intro(project.getProjectIntro())
                            .project_detail(project.getProjectDetail())
                            .project_start_date(project.getProjectStartDate())
                            .project_end_date(project.getProjectEndDate())
                            .build()
            );
        }
        return projects;
    }

    private String getFirstQuestion(InterviewVideo video) {
        List<InterviewAnswer> answers = interviewAnswerRepository
                .findByInterviewVideoOrderByCreatedAtAsc(video);

        if (!answers.isEmpty()) {
            return answers.get(0).getInterviewQuestion();
        }

        return null;
    }

    // 면접 피드백 상세 조회
    public InterviewFeedbackResponseDto findInterviewFeedbackDetail(Integer interviewVideoId, Integer userId) {

        userReadService.findUserByIdOrElseThrow(userId);
        InterviewVideo interviewVideo = interviewReadService.findInterviewVideoByIdOrElseThrow(interviewVideoId);

        if (interviewVideo.getCoverLetterInterview() != null) {
            CoverLetterInterview coverLetterInterview = interviewReadService.findCoverLetterInterviewById(interviewVideo.getCoverLetterInterview().getCoverLetterInterviewId());
            if (!userId.equals(coverLetterInterview.getUser().getUserId())) {
                throw new BaseException(INVALID_USER);
            }
        } else {
            Interview interview = interviewReadService.findInterviewById(interviewVideo.getInterview().getInterviewId());
            if (!userId.equals(interview.getUser().getUserId())) {
                throw new BaseException(INVALID_USER);
            }
        }

        // 면접 답변 조회
        List<InterviewAnswer> interviewAnswers = interviewAnswerRepository.findInterviewAnswerByInterviewVideo(interviewVideo);

        List<InterviewFeedbackDetailDto> interviewFeedbackDetailList = new ArrayList<>();

        for (InterviewAnswer answer : interviewAnswers) {

            // 답변 꼬리질문 String > List<String> 역직렬화
            List<String> followUpQuestions = new ArrayList<>();
            String rawJson = answer.getInterviewFollowUpQuestion();
            if (rawJson != null && !rawJson.isBlank()) {
                try {
                    followUpQuestions = new ObjectMapper().readValue(rawJson, new TypeReference<List<String>>() {
                    });
                } catch (JsonProcessingException e) {
                    throw new BaseException(DESERIALIZATION_FAIL);
                }
            }

            interviewFeedbackDetailList.add(
                    InterviewFeedbackDetailDto.builder()
                            .interviewAnswerId(answer.getInterviewAnswerId())
                            .interviewQuestion(answer.getInterviewQuestion())
                            .interviewAnswer(answer.getInterviewAnswer())
                            .interviewAnswerFeedback(answer.getInterviewAnswerFeedback())
                            .interviewAnswerFollowUpQuestion(followUpQuestions)
                            .interviewAnswerVideoUrl(answer.getInterviewVideoUrl())
                            .interviewAnswerLength(answer.getVideoLength())
                            .build()
            );
        }

        return InterviewFeedbackResponseDto.builder()
                .interviewVideoId(interviewVideoId)
                .interviewTitle(interviewVideo.getInterviewTitle())
                .interviewFeedback(interviewVideo.getInterviewFeedback())
                .interviewCategory(interviewVideo.isSelectQuestion() ? "단일문항" : "모의면접")
                .interviewQuestionCategory(interviewVideo.getInterviewCategory().name())
                .date(interviewVideo.getStart().toLocalDate())
                .interviewFeedbackList(interviewFeedbackDetailList)
                .build();

    }

    public List<InterviewThumbNailResponseDto> findAllInterview(Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);

        // 한 번의 쿼리로 모든 InterviewVideo 조회 (Join 활용, 날짜 기준 내림차순 정렬)
        List<InterviewVideo> interviewVideos = interviewVideoRepository.findAllByUser(user);

        // 모든 InterviewVideo ID를 수집
        List<Integer> videoIds = interviewVideos.stream()
                .map(InterviewVideo::getInterviewVideoId)
                .collect(Collectors.toList());

        // 한 번의 쿼리로 각 InterviewVideo의 첫 번째 답변 조회
        List<Map<String, Object>> firstQuestionsResults = interviewAnswerRepository
                .findFirstQuestionsByVideoIds(videoIds);

        // Map<videoId, firstQuestion> 형태로 변환
        Map<Integer, String> firstQuestionsByVideoId = firstQuestionsResults.stream()
                .collect(Collectors.toMap(
                        map -> (Integer) map.get("videoId"),
                        map -> (String) map.get("firstQuestion")
                ));

        // DTO 구성
        return interviewVideos.stream()
                .map(video -> InterviewThumbNailResponseDto.builder()
                        .interviewVideoId(video.getInterviewVideoId())
                        .interviewCategory(video.getInterviewCategory())
                        .selectQuestion(video.isSelectQuestion())
                        .interviewTitle(video.getInterviewTitle())
                        .start(video.getStart())
                        .firstQuestion(firstQuestionsByVideoId.get(video.getInterviewVideoId()))
                        .build())
                .collect(Collectors.toList());
    }

    public InterviewDetailResponseDto findInterviewDetail(Integer interviewVideoId, Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);
        InterviewVideo video = interviewReadService.findInterviewVideoByIdWithInterviewAndCoverLetterInterviewOrElseThrow(interviewVideoId);

        // 소유권 확인
        if((video.getInterview() != null && !video.getInterview().getUser().equals(user))
            || (video.getCoverLetterInterview() != null && !video.getCoverLetterInterview().getUser().equals(user))
            || (video.getInterview() == null && video.getCoverLetterInterview() == null)) {
            throw new BaseException(INTERVIEW_VIDEO_MISMATCH);
        }

        List<InterviewAnswer> answers = interviewAnswerRepository.findAllByInterviewVideo(video);

        List<InterviewQuestionResponseDto> questions = answers.stream()
                        .map(answer -> InterviewQuestionResponseDto.builder()
                                .interviewAnswerId(answer.getInterviewAnswerId())
                                .interviewVideoUrl(answer.getInterviewVideoUrl())
                                .videoLength(answer.getVideoLength())
                                .interviewQuestion(answer.getInterviewQuestion())
                                .interviewQuestionCategory(answer.getInterviewQuestionCategory())
                                .build())
                        .toList();

        return InterviewDetailResponseDto.builder()
                .interviewVideoId(video.getInterviewVideoId())
                .interviewCategory(video.getInterviewCategory())
                .selectQuestion(video.isSelectQuestion())
                .interviewTitle(video.getInterviewTitle())
                .start(video.getStart())
                .questions(questions)
                .build();
    }

    public Map<String, String> deleteInterviewVideo(Integer interviewVideoId, Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);
        InterviewVideo video = interviewReadService.findInterviewVideoByIdWithInterviewAndCoverLetterInterviewOrElseThrow(interviewVideoId);

        // 소유권 확인
        if((video.getInterview() != null && !video.getInterview().getUser().equals(user))
                || (video.getCoverLetterInterview() != null && !video.getCoverLetterInterview().getUser().equals(user))
                || (video.getInterview() == null && video.getCoverLetterInterview() == null)) {
            throw new BaseException(INTERVIEW_VIDEO_MISMATCH);
        }

        List<InterviewAnswer> answers = interviewAnswerRepository.findAllByInterviewVideo(video);

        if (!answers.isEmpty()) {
            // S3 URL 목록 추출
            List<String> s3Urls = answers.stream()
                    .map(InterviewAnswer::getInterviewVideoUrl)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            try {
                // 배치 삭제 시도
                s3UploadService.deleteVideos(s3Urls);

                // 모든 S3 삭제 성공 시에만 DB 삭제
                interviewAnswerRepository.deleteAll(answers);

            } catch (BaseException e) {
                log.error("❌ S3 삭제 실패로 인한 DB 삭제 취소");
                throw e; // 트랜잭션 롤백
            }
        }
        interviewVideoRepository.delete(video);

        return Map.of("message", "면접 영상이 삭제되었습니다.");
    }
}