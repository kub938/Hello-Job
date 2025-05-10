package com.ssafy.hellojob.domain.interview.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.hellojob.domain.coverletter.entity.CoverLetter;
import com.ssafy.hellojob.domain.coverletter.repository.CoverLetterRepository;
import com.ssafy.hellojob.domain.coverletter.service.CoverLetterReadService;
import com.ssafy.hellojob.domain.interview.dto.request.*;
import com.ssafy.hellojob.domain.interview.dto.response.*;
import com.ssafy.hellojob.domain.interview.entity.*;
import com.ssafy.hellojob.domain.interview.repository.*;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.domain.user.service.UserReadService;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

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
    private final InterviewReadService interviewReadService;
    private final CoverLetterReadService coverLetterReadService;

    private final UserReadService userReadService;

    private final Integer QUESTION_SIZE = 3;

    @Value("${OPENAI_API_URL}")
    private String openAiUrl;

    @Value("${OPENAI_API_KEY}")
    private String openAiKey;

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

        CoverLetterInterview coverLetterInterview = coverLetterInterviewRepository.findByUserAndCoverLetter(user, coverLetter)
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
                .orElseGet(() -> {
                    Interview newInterview = Interview.of(user, true);
                    return interviewRepository.save(newInterview);
                });

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
                .orElseGet(() -> {
                    Interview newInterview = Interview.of(user, false);
                    return interviewRepository.save(newInterview);
                });

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

        CoverLetterInterview interview = coverLetterInterviewRepository.findByUserAndCoverLetter(user, coverLetter)
                .orElseGet(() -> {
                    CoverLetterInterview newInterview = CoverLetterInterview.of(user, coverLetter); // 팩토리 메서드 예시
                    return coverLetterInterviewRepository.save(newInterview);
                });


        InterviewVideo video = InterviewVideo.of(interview, null, true, LocalDateTime.now());
        interviewVideoRepository.save(video);

        return SelectInterviewStartResponseDto.builder()
                .interviewId(interview.getCoverLetterInterviewId())
                .interviewVideoId(video.getInterviewVideoId())
                .build();

    }

    public InterviewStartResponseDto startCsRandomInterview(Integer userId){
        User user = userReadService.findUserByIdOrElseThrow(userId);

        Interview interview = interviewRepository.findByUserAndCs(user, true)
                .orElseGet(() -> {
                    Interview newInterview = Interview.of(user, true);
                    return interviewRepository.save(newInterview);
                });

        InterviewVideo video = InterviewVideo.of(null, interview, true, LocalDateTime.now());
        interviewVideoRepository.save(video);

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

    public InterviewStartResponseDto startPersonalityRandomInterview(Integer userId){
        User user = userReadService.findUserByIdOrElseThrow(userId);

        Interview interview = interviewRepository.findByUserAndCs(user, true)
                .orElseGet(() -> {
                    Interview newInterview = Interview.of(user, true);
                    return interviewRepository.save(newInterview);
                });

        InterviewVideo video = InterviewVideo.of(null, interview, true, LocalDateTime.now());
        interviewVideoRepository.save(video);

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

    public InterviewStartResponseDto startCoverLetterRandomInterview(Integer coverLetterId, Integer userId){
        User user = userReadService.findUserByIdOrElseThrow(userId);

        CoverLetter coverLetter = coverLetterRepository.findById(coverLetterId)
                .orElseThrow(() -> new BaseException(ErrorCode.COVER_LETTER_NOT_FOUND));

        CoverLetterInterview interview = coverLetterInterviewRepository.findByUserAndCoverLetter(user, coverLetter)
                .orElseGet(() -> {
                    CoverLetterInterview newInterview = CoverLetterInterview.of(user, coverLetter); // 팩토리 메서드 예시
                    return coverLetterInterviewRepository.save(newInterview);
                });

        InterviewVideo video = InterviewVideo.of(interview, null, true, LocalDateTime.now());
        interviewVideoRepository.save(video);

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

    public void saveCsQuestions(Integer userId, SelectQuestionRequestDto requestDto){
        User user = userReadService.findUserByIdOrElseThrow(userId);

        InterviewVideo video = interviewVideoRepository.findById(requestDto.getInterviewVideoId())
                .orElseThrow(() -> new BaseException(ErrorCode.INTERVIEW_VIDEO_NOT_FOUND));

        for (QuestionBankIdDto dto : requestDto.getQuestionIdList()) {
            Integer questionId = dto.getQuestionBankId();

            CsQuestionBank question = csQuestionBankRepository.findById(questionId)
                    .orElseThrow(() -> new BaseException(ErrorCode.QUESTION_NOT_FOUND));

            InterviewAnswer answer = InterviewAnswer.of(
                    video,
                    question.getCsQuestion(),
                    InterviewQuestionCategory.valueOf(question.getCsCategory().name())
            );
            interviewAnswerRepository.save(answer);
        }


    }

    public void savePersonalityQuestions(Integer userId, SelectQuestionRequestDto requestDto){
        User user = userReadService.findUserByIdOrElseThrow(userId);

        InterviewVideo video = interviewVideoRepository.findById(requestDto.getInterviewVideoId())
                .orElseThrow(() -> new BaseException(ErrorCode.INTERVIEW_VIDEO_NOT_FOUND));

        for (QuestionBankIdDto dto : requestDto.getQuestionIdList()) {
            Integer questionId = dto.getQuestionBankId();

            PersonalityQuestionBank question = personalityQuestionBankRepository.findById(questionId)
                    .orElseThrow(() -> new BaseException(ErrorCode.QUESTION_NOT_FOUND));

            InterviewAnswer answer = InterviewAnswer.of(
                    video,
                    question.getPersonalityQuestion(),
                    InterviewQuestionCategory.valueOf("인성면접")
            );
            interviewAnswerRepository.save(answer);
        }


    }

    public void saveCoverLetterQuestions(Integer userId, SelectQuestionRequestDto requestDto){
        User user = userReadService.findUserByIdOrElseThrow(userId);

        InterviewVideo video = interviewVideoRepository.findById(requestDto.getInterviewVideoId())
                .orElseThrow(() -> new BaseException(ErrorCode.INTERVIEW_VIDEO_NOT_FOUND));

        for (QuestionBankIdDto dto : requestDto.getQuestionIdList()) {
            Integer questionId = dto.getQuestionBankId();

            CoverLetterQuestionBank question = coverLetterQuestionBankRepository.findById(questionId)
                    .orElseThrow(() -> new BaseException(ErrorCode.QUESTION_NOT_FOUND));

            InterviewAnswer answer = InterviewAnswer.of(
                    video,
                    question.getCoverLetterQuestion(),
                    InterviewQuestionCategory.valueOf("자기소개서면접")
            );
            interviewAnswerRepository.save(answer);
        }


    }

    public CoverLetterQuestionSaveResponseDto saveNewCoverLetterQuestion(Integer userId, CoverLetterQuestionSaveRequestDto requestDto){
        User user = userReadService.findUserByIdOrElseThrow(userId);

        CoverLetter coverLetter = coverLetterRepository.findById(requestDto.getCoverLetterId())
                .orElseThrow(() -> new BaseException(ErrorCode.COVER_LETTER_NOT_FOUND));

        CoverLetterInterview coverLetterInterview = coverLetterInterviewRepository.findByUserAndCoverLetter(user, coverLetter)
                .orElseThrow(() -> new BaseException(ErrorCode.COVER_LETTER_NOT_FOUND));

        List<CoverLetterQuestionIdDto> questionIdList = new ArrayList<>();

        for(CoverLetterQuestionDto dto: requestDto.getCoverLetterQuestion()){
            String newQuestion = dto.getCoverLetterQuestion();
            CoverLetterQuestionBank newQuestions = CoverLetterQuestionBank.of(coverLetterInterview, newQuestion);
            coverLetterQuestionBankRepository.save(newQuestions);
            questionIdList.add(CoverLetterQuestionIdDto.builder()
                            .coverLetterQuestionBankId(newQuestions.getCoverLetterQuestionBankId())
                    .build());
        }

        return CoverLetterQuestionSaveResponseDto.builder()
                .coverLetterId(coverLetter.getCoverLetterId())
                .coverLetterInterviewId(coverLetterInterview.getCoverLetterInterviewId())
                .coverLetterQuestionSaveId(questionIdList)
                .build();
    }

    public WriteMemoResponseDto createMemo(WriteMemoRequestDto requestDto, Integer userId) {

        User user = userReadService.findUserByIdOrElseThrow(userId);
        CsQuestionBank csQuestionBank = null;
        PersonalityQuestionBank personalityQuestionBank = null;
        CoverLetterQuestionBank coverLetterQuestionBank = null;
        CoverLetterInterview coverLetterInterview = null;
        InterviewQuestionMemo memo = null;

        if(requestDto.getCsQuestionBankId() != null) {
            csQuestionBank = interviewReadService.findCsQuestionByIdOrElseThrow(requestDto.getCsQuestionBankId());
            memo = interviewReadService.findInterviewQuestionMemoByUserAndCsQuestionOrElseReturnNull(user, csQuestionBank);
        } else if(requestDto.getPersonalityQuestionBankId() != null) {
            personalityQuestionBank = interviewReadService.findPersonalityQuestionByIdOrElseThrow(requestDto.getPersonalityQuestionBankId());
            memo = interviewReadService.findInterviewQuestionMemoByUserAndPersonalityQuestionOrElseReturnNull(user, personalityQuestionBank);
        } else if(requestDto.getCoverLetterQuestionBankId() != null) {
            coverLetterQuestionBank = interviewReadService.findCoverLetterQuestionByIdWithCoverLetterOrElseThrow(requestDto.getCoverLetterQuestionBankId());
            coverLetterInterview = interviewReadService.findCoverLetterInterviewByIWithUserdOrElseThrow(requestDto.getInterviewId());
            if(!coverLetterQuestionBank.getCoverLetterInterview().equals(coverLetterInterview) || !coverLetterInterview.getUser().equals(user)) {
                throw new BaseException(INTERVIEW_QUESTION_MEMO_MISMATCH);
            }
            memo = interviewReadService.findInterviewQuestionMemoByUserAndCoverLetterQuestionOrElseReturnNull(user, coverLetterQuestionBank);
        } else {
            throw new BaseException(QUESTION_TYPE_REQUIRED);
        }

        if(memo != null) {
            memo.updateMemo(requestDto.getMemo());
        } else {
            memo = InterviewQuestionMemo.builder()
                    .user(user)
                    .csQuestionBank(csQuestionBank)
                    .personalityQuestionBank(personalityQuestionBank)
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

        if(!memo.getUser().equals(user)) {
            throw new BaseException(INTERVIEW_QUESTION_MEMO_MISMATCH);
        }

        memo.updateMemo(newMemo);
        interviewQuestionMemoRepository.save(memo);
        return Map.of("message", "성공적으로 수정되었습니다.");
    }

    public String transcribeAudio(MultipartFile audioFile) throws Exception {
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

        if (response.getStatusCode().is2xxSuccessful()) {

            ObjectMapper objectMapper = new ObjectMapper();
            String text = objectMapper.readTree(response.getBody()).get("text").asText();

            return text;
        } else {
            throw new RuntimeException("OpenAI API 요청 실패: " + response.getStatusCode());
        }
    }

    @Transactional
    public void saveInterviewAnswer(Integer userId, String answer, InterviewInfo interviewInfo){
        userReadService.findUserByIdOrElseThrow(userId);


        InterviewAnswer interviewAnswer = interviewReadService.findInterviewAnswerByIdOrElseThrow(interviewInfo.getInterviewAnswerId());
        InterviewVideo interviewVideo = interviewReadService.findInterviewVideoByIdOrElseThrow(interviewAnswer.getInterviewVideo().getInterviewVideoId());

        if(interviewAnswer.getInterviewQuestionCategory().name().equals("자기소개서면접")){
            CoverLetterInterview coverLetterInterview = interviewReadService.findCoverLetterInterviewById(interviewVideo.getCoverLetterInterview().getCoverLetterInterviewId());
            if(!userId.equals(coverLetterInterview.getUser().getUserId())){
                throw new BaseException(INVALID_USER);
            }
        } else {
            Interview interview = interviewReadService.findInterviewById(interviewVideo.getInterview().getInterviewId());
            if(!userId.equals(interview.getUser().getUserId())){
                throw new BaseException(INVALID_USER);
            }
        }
        
        interviewAnswer.addInterviewAnswer(answer);
    }

}
