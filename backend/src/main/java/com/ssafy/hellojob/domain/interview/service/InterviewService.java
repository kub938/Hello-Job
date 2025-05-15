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

    private final Integer QUESTION_SIZE = 5;

//    @Value("${FFPROBE_PATH}")
//    private String ffprobe_path;


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

    public QuestionDetailResponseDto findCsQuestionDetail(Integer questionId, Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);
        CsQuestionBank questionBank = csQuestionBankRepository.findById(questionId)
                .orElseThrow(() -> new BaseException(QUESTION_NOT_FOUND));

        InterviewQuestionMemo memo = interviewReadService.findInterviewQuestionMemoByUserAndCsQuestionOrElseReturnNull(user, questionBank);
        if(memo == null) throw new BaseException(INTERVIEW_QUESTION_MEMO_NOT_FOUND);

        return QuestionDetailResponseDto.builder()
                .questionBankId(questionId)
                .question(questionBank.getCsQuestion())
                .memo(memo.getMemo())
                .build();
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

    public QuestionDetailResponseDto findPersonalityQuestionDetail(Integer questionId, Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);
        PersonalityQuestionBank questionBank = personalityQuestionBankRepository.findById(questionId)
                .orElseThrow(() -> new BaseException(QUESTION_NOT_FOUND));

        InterviewQuestionMemo memo = interviewReadService.findInterviewQuestionMemoByUserAndPersonalityQuestionOrElseReturnNull(user, questionBank);
        if(memo == null) throw new BaseException(INTERVIEW_QUESTION_MEMO_NOT_FOUND);

        return QuestionDetailResponseDto.builder()
                .questionBankId(questionId)
                .question(questionBank.getPersonalityQuestion())
                .memo(memo.getMemo())
                .build();
    }

    public List<QuestionListResponseDto> getCoverLetterQuestionList(Integer coverLetterId, Integer userId){
        User user = userReadService.findUserByIdOrElseThrow(userId);

        CoverLetter coverLetter = coverLetterReadService.findCoverLetterByIdOrElseThrow(coverLetterId);

        CoverLetterInterview coverLetterInterview = interviewReadService.findCoverLetterInterviewById(coverLetterId);

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

        if(!questionBank.getCoverLetterInterview().equals(coverLetterInterview))
            throw new BaseException(COVER_LETTER_QUESTION_MISMATCH);

        InterviewQuestionMemo memo = interviewReadService.findInterviewQuestionMemoByUserAndCoverLetterQuestionOrElseReturnNull(user, questionBank);
        if(memo == null) throw new BaseException(INTERVIEW_QUESTION_MEMO_NOT_FOUND);

        return QuestionDetailResponseDto.builder()
                .questionBankId(questionId)
                .question(questionBank.getCoverLetterQuestion())
                .memo(memo.getMemo())
                .build();
    }

    public SelectInterviewStartResponseDto startCsSelectInterview(Integer userId){
        User user = userReadService.findUserByIdOrElseThrow(userId);

        Interview interview = interviewRepository.findByUserAndCs(user, true)
                .orElseGet(() -> {
                    Interview newInterview = Interview.of(user, true);
                    return interviewRepository.save(newInterview);
                });

        InterviewVideo video = InterviewVideo.of(null, interview, true, LocalDateTime.now(), InterviewCategory.valueOf("CS"));
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

        InterviewVideo video = InterviewVideo.of(null, interview, true, LocalDateTime.now(), InterviewCategory.valueOf("PERSONALITY"));
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


        InterviewVideo video = InterviewVideo.of(interview, null, true, LocalDateTime.now(), InterviewCategory.valueOf("COVERLETTER"));
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

        InterviewVideo video = InterviewVideo.of(null, interview, true, LocalDateTime.now(), InterviewCategory.valueOf("CS"));
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

        InterviewVideo video = InterviewVideo.of(null, interview, true, LocalDateTime.now(), InterviewCategory.valueOf("PERSONALITY"));
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

        InterviewVideo video = InterviewVideo.of(interview, null, true, LocalDateTime.now(), InterviewCategory.valueOf("COVERLETTER"));
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

    public InterviewStartResponseDto saveCsQuestions(Integer userId, SelectQuestionRequestDto requestDto){
        User user = userReadService.findUserByIdOrElseThrow(userId);

        InterviewVideo video = interviewReadService.findInterviewVideoByIdOrElseThrow(requestDto.getInterviewVideoId());

        List<QuestionAndAnswerListResponseDto> questionList = new ArrayList<>();

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

    public InterviewStartResponseDto savePersonalityQuestions(Integer userId, SelectQuestionRequestDto requestDto){
        User user = userReadService.findUserByIdOrElseThrow(userId);

        InterviewVideo video = interviewReadService.findInterviewVideoByIdOrElseThrow(requestDto.getInterviewVideoId());

        List<QuestionAndAnswerListResponseDto> questionList = new ArrayList<>();

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

    public InterviewStartResponseDto saveCoverLetterQuestions(Integer userId, SelectQuestionRequestDto requestDto){
        User user = userReadService.findUserByIdOrElseThrow(userId);

        InterviewVideo video = interviewReadService.findInterviewVideoByIdOrElseThrow(requestDto.getInterviewVideoId());

        List<QuestionAndAnswerListResponseDto> questionList = new ArrayList<>();

        for (Integer questionId : requestDto.getQuestionIdList()) {

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

    public Map<String, String> saveNewCoverLetterQuestion(Integer userId, CoverLetterQuestionSaveRequestDto requestDto){
        User user = userReadService.findUserByIdOrElseThrow(userId);

        CoverLetter coverLetter = coverLetterReadService.findCoverLetterByIdOrElseThrow(requestDto.getCoverLetterId());

        CoverLetterInterview coverLetterInterview = coverLetterInterviewRepository.findByCoverLetter(coverLetter)
                .orElseGet(() -> {
                    CoverLetterInterview newInterview = CoverLetterInterview.of(user, coverLetter); // 팩토리 메서드
                    return newInterview;
                });

        List<CoverLetterQuestionIdDto> questionIdList = new ArrayList<>();

        for(String newQuestion: requestDto.getCoverLetterQuestion()){

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

        if(memo != null) {
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
        PersonalityQuestionBank personalityQuestionBank  = interviewReadService.findPersonalityQuestionByIdOrElseThrow(requestDto.getQuestionBankId());
        InterviewQuestionMemo memo = interviewReadService.findInterviewQuestionMemoByUserAndPersonalityQuestionOrElseReturnNull(user, personalityQuestionBank);

        if(memo != null) {
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

        if(!coverLetterInterview.equals(coverLetterQuestionBank.getCoverLetterInterview())) {
            throw new BaseException(COVER_LETTER_QUESTION_MISMATCH);
        }

        InterviewQuestionMemo memo = interviewReadService.findInterviewQuestionMemoByUserAndCoverLetterQuestionOrElseReturnNull(user, coverLetterQuestionBank);

        if(memo != null) {
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

        if(!memo.getUser().equals(user)) {
            throw new BaseException(INTERVIEW_QUESTION_MEMO_MISMATCH);
        }

        memo.updateMemo(newMemo);
        interviewQuestionMemoRepository.save(memo);
        return Map.of("message", "성공적으로 수정되었습니다.");
    }

    public Map<String, String> deleteMemo(Integer memoId, Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);
        InterviewQuestionMemo memo = interviewReadService.findInterviewQuestionMemoWithUserByIdOrElseThrow(memoId);

        if(!memo.getUser().equals(user)) {
            throw new BaseException(INTERVIEW_QUESTION_MEMO_MISMATCH);
        }

        interviewQuestionMemoRepository.delete(memo);
        return Map.of("message", "메모가 삭제되었습니다.");
    }

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

            if (response.getStatusCode().is2xxSuccessful()) {
                ObjectMapper objectMapper = new ObjectMapper();
                String text = objectMapper.readTree(response.getBody()).get("text").asText();
                return text;
            } else {
                return "stt 변환에 실패했습니다";
            }
        } catch (Exception e) {
            return "stt 변환에 실패했습니다";
        }
    }


    // 면접 답변 저장
    @Transactional
    public Map<String, String> saveInterviewAnswer(Integer userId, String url, String answer, InterviewInfo interviewInfo, MultipartFile videoFile) throws InterruptedException, IOException {
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
        interviewAnswer.addInterviewVideoUrl(url);
        interviewAnswer.addVideoLength(getVideoDurationWithFFprobe(videoFile));

        return Map.of("message", "정상적으로 저장되었습니다.");
    }

    public String getVideoDurationWithFFprobe(MultipartFile videoFile) throws IOException, InterruptedException {
        File tempFile = File.createTempFile("upload", ".mp4");
        videoFile.transferTo(tempFile);

        String ffprobe_path = "ffprobe.exe";

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
        tempFile.delete();

        if (durationStr == null) {
            log.error("⚠️ ffprobe 결과가 null입니다. 영상 길이를 분석하지 못했습니다.");
//            throw new BaseException("영상 길이를 분석할 수 없습니다.");
        }

        double durationInSeconds = Double.parseDouble(durationStr.trim());

        // 초 단위를 hh:mm:ss 형식으로 변환
        int hours = (int) durationInSeconds / 3600;
        int minutes = ((int) durationInSeconds % 3600) / 60;
        int seconds = (int) durationInSeconds % 60;

        return String.format("%02d:%02d:%02d", hours, minutes, seconds);
    }



    @Transactional
    public CreateCoverLetterQuestionResponseDto createCoverLetterQuestion(Integer userId, CoverLetterIdRequestDto requestDto){
        User user = userReadService.findUserByIdOrElseThrow(userId);
        CoverLetter coverLetter = coverLetterReadService.findCoverLetterByIdOrElseThrow(requestDto.getCoverLetterId());

        if(!userId.equals(coverLetter.getUser().getUserId())){
            throw new BaseException(INVALID_USER);
        }

        List<CoverLetterOnlyContentDto> coverLetterContents = coverLetterContentService.getWholeContentDetail(requestDto.getCoverLetterId());
        List<CoverLetterContentFastAPIRequestDto> coverLetterContentFastAPIRequestDto = searchCoverLetterContents(coverLetterContents);

        CoverLetterFastAPIRequestDto coverLetterFastAPIRequestDto = CoverLetterFastAPIRequestDto.builder()
                .cover_letter_id(coverLetter.getCoverLetterId())
                .cover_letter_contents(coverLetterContentFastAPIRequestDto)
                .build();

        List<Integer> experienceIds = new ArrayList<>();
        List<Integer> projectIds = new ArrayList<>();

        for(CoverLetterOnlyContentDto content:coverLetterContents){
            experienceIds = coverLetterExperienceRepository.findExperiencesByContentId(content.getContentId());
            projectIds = coverLetterExperienceRepository.findProjectsByContentId(content.getContentId());
        }

        List<ExperienceFastAPIRequestDto> experiences = new ArrayList<>();
        List<ProjectFastAPIRequestDto> projects = new ArrayList<>();
        if(!experienceIds.isEmpty()){
            experiences = searchExperiencesByCoverLetterContentId(experienceIds);
        }

        if(!projects.isEmpty()){
            projects = searchProjectsByCoverLetterContentId(projectIds);
        }

        CreateCoverLetterFastAPIRequestDto createCoverLetterFastAPIRequestDto = CreateCoverLetterFastAPIRequestDto.builder()
                .cover_letter(coverLetterFastAPIRequestDto)
                .experiences(experiences)
                .projects(projects)
                .build();

        CreateCoverLetterFastAPIResponseDto fastAPIResponseDto = fastApiClientService.sendCoverLetterToFastApi(createCoverLetterFastAPIRequestDto);

        CreateCoverLetterQuestionResponseDto responseDto = CreateCoverLetterQuestionResponseDto.builder()
                .coverLetterId(coverLetter.getCoverLetterId())
                .coverLetterQuestion(fastAPIResponseDto.getExpected_questions())
                .build();

        return responseDto;
    }

    // 면접 종료
    @Transactional
    public EndInterviewResponseDto endInterview(Integer userId, EndInterviewRequestDto videoInfo) throws InterruptedException {
        // 유저, 인터뷰 영상, 인터뷰 답변 객체 조회
        User user = userReadService.findUserByIdOrElseThrow(userId);
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
        if(interviewVideo.getCoverLetterInterview() != null){
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

        interviewVideo.addTitle(videoInfo.getInterviewTitle());
        interviewVideo.addEndTime(LocalDateTime.now());

        // 여기서부터 fast API 관련 로직
        // 답변 객체 조회(stt 변환에 성공한 경우만)
        List<InterviewQuestionAndAnswerRequestDto> interviewQuestionAndAnswerRequestDto =
                searchInterviewQuestionAndAnswer(interviewAnswers).stream()
                        .filter(dto -> dto.getInterview_answer() != null && !dto.getInterview_answer().equals("stt 변환에 실패했습니다"))
                        .toList();

        // 모든 항목의 답변이 stt변환에 실패했을 때
        if(interviewQuestionAndAnswerRequestDto.isEmpty()){
            return EndInterviewResponseDto.builder()
                    .interviewVideoId(interviewVideo.getInterviewVideoId())
                    .build();
        }

        // 자소서 조회
        List<CoverLetterContentFastAPIRequestDto> coverLetterContentFastAPIRequestDto = new ArrayList<>();

        if(interviewVideo.getCoverLetterInterview() != null){
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

        for(SingleInterviewFeedbackFastAPIResponseDto singleInterviewFeedback:fastAPIResponseDto.getSingle_feedbacks()){

            InterviewAnswer targetAnswer = interviewAnswers.stream()
                    .filter(ans -> ans.getInterviewAnswerId().equals(singleInterviewFeedback.getInterview_answer_id()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("해당 interview_answer_id를 찾을 수 없습니다: " + singleInterviewFeedback.getInterview_answer_id()));

            String jsonFeedbacks;
            try {
                jsonFeedbacks = new ObjectMapper().writeValueAsString(singleInterviewFeedback.getFollow_up_questions());
            } catch (JsonProcessingException e) {
                throw new RuntimeException("꼬리 질문 직렬화 실패", e);
            }

            targetAnswer.addInterviewAnswerFeedback(singleInterviewFeedback.getFeedback());
            targetAnswer.addInterviewFollowUpQuestion(jsonFeedbacks);

        }

        return EndInterviewResponseDto.builder()
                .interviewVideoId(interviewVideo.getInterviewVideoId())
                .build();
    }

    public List<InterviewQuestionAndAnswerRequestDto> searchInterviewQuestionAndAnswer(List<InterviewAnswer> interviewAnswers){
        List<InterviewQuestionAndAnswerRequestDto> result = new ArrayList<>();
        for(InterviewAnswer answer:interviewAnswers){
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

    public List<CoverLetterContentFastAPIRequestDto> searchCoverLetterContents(List<CoverLetterOnlyContentDto> coverLetterContents){
        List<CoverLetterContentFastAPIRequestDto> coverLetterContentFastAPIRequestDto = new ArrayList<>();
        for(CoverLetterOnlyContentDto content:coverLetterContents){
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

    public List<ExperienceFastAPIRequestDto> searchExperiencesByCoverLetterContentId(List<Integer> experienceIds){
        List<ExperienceFastAPIRequestDto> experiences = new ArrayList<>();
        if(!experienceIds.isEmpty()){
            for(Integer experienceId: experienceIds){
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

    public List<ProjectFastAPIRequestDto> searchProjectsByCoverLetterContentId(List<Integer> projectIds){
        List<ProjectFastAPIRequestDto> projects = new ArrayList<>();
        for(Integer projectId:projectIds){
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

    public AllInterviewResponseDto findAllInterview(Integer interviewId, Integer userId) {
        User user = userReadService.findUserByIdOrElseThrow(userId);
        Interview interview = interviewReadService.findInterviewByIdAndUserOrElseThrow(interviewId, user);

        List<InterviewVideo> videos = interviewVideoRepository.findAllByInterviewOrderByStartDesc(interview);

        List<InterviewResponseDto> selectQuestionInterview = new ArrayList<>();
        List<InterviewResponseDto> simulateInterview = new ArrayList<>();

        for (InterviewVideo video : videos) {
            InterviewResponseDto dto = InterviewResponseDto.builder()
                    .type(video.getInterviewCategory().name())
                    .start(video.getStart())
                    .firstQuestion(getFirstQuestion(video))
                    .build();

            if (video.isSelectQuestion()) {
                selectQuestionInterview.add(dto);
            } else {
                simulateInterview.add(dto);
            }
        }

        return AllInterviewResponseDto.builder()
                .selectQuestionInterview(selectQuestionInterview)
                .simulateInterview(simulateInterview)
                .build();
    }

    private String getFirstQuestion(InterviewVideo video) {
        List<InterviewAnswer> answers = interviewAnswerRepository
                .findByInterviewVideoOrderByCreatedAtAsc(video);

        if (!answers.isEmpty()) {
            return answers.get(0).getInterviewQuestion();
        }

        return null;
    }

    public InterviewFeedbackResponseDto findInterviewFeedbackDetail(Integer interviewVideoId, Integer userId){

        User user = userReadService.findUserByIdOrElseThrow(userId);
        InterviewVideo interviewVideo = interviewReadService.findInterviewVideoByIdOrElseThrow(interviewVideoId);

        List<InterviewAnswer> interviewAnswers = interviewAnswerRepository.findInterviewAnswerByInterviewVideo(interviewVideo);

        List<InterviewFeedbackDetailDto> interviewFeedbackDetailList = new ArrayList<>();

        for(InterviewAnswer answer:interviewAnswers){

            List<String> followUpQuestions = new ArrayList<>();
            String rawJson = answer.getInterviewFollowUpQuestion();

            if (rawJson != null && !rawJson.isBlank()) {
                try {
                    followUpQuestions = new ObjectMapper().readValue(rawJson, new TypeReference<List<String>>() {});
                } catch (JsonProcessingException e) {
                    throw new RuntimeException("꼬리 질문 역직렬화 실패", e);
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


}
