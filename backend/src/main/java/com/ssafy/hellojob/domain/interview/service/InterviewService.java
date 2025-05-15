package com.ssafy.hellojob.domain.interview.service;

import com.fasterxml.jackson.core.JsonProcessingException;
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

import java.time.Duration;
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
                .coverLetterInterviewId(coverLetter.getCoverLetterId())
                .coverLetterQuestionList(fastAPIResponseDto.getExpected_questions())
                .build();

        return responseDto;
    }

    // 면접 종료
    @Transactional
    public void endInterview(Integer userId, String url, VideoInfo videoInfo){
        // 유저, 인터뷰 영상, 인터뷰 답변 객체 조회
        User user = userReadService.findUserByIdOrElseThrow(userId);
        InterviewVideo interviewVideo = interviewReadService.findInterviewVideoByIdOrElseThrow(videoInfo.getInterviewVideoId());
        List<InterviewAnswer> interviewAnswers = interviewAnswerRepository.findInterviewAnswerByInterviewVideo(interviewVideo);

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

        // 시작 시간 및 종료 시간 기반으로 영상 시간 계산 후 저장
        interviewVideo.addInterviewVideoUrl(url);
        interviewVideo.addEndTime(LocalDateTime.now());

        LocalDateTime start = interviewVideo.getStart();
        LocalDateTime end = interviewVideo.getEnd();

        Duration duration = Duration.between(start, end);
        if (duration.isNegative()) {
            duration = Duration.ZERO; // 음수 방지
        }

        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();  // Java 9 이상
        long seconds = duration.toSecondsPart();  // Java 9 이상

        String formatted = String.format("%02d:%02d:%02d", hours, minutes, seconds);
        interviewVideo.addVideoLength(formatted); 

        // 여기서부터 fast API 관련 로직
        // 답변 객체 조회(stt 변환에 성공한 경우만)
        List<InterviewQuestionAndAnswerRequestDto> interviewQuestionAndAnswerRequestDto =
                searchInterviewQuestionAndAnswer(interviewAnswers).stream()
                        .filter(dto -> dto.getInterview_answer() != null && !dto.getInterview_answer().equals("stt 변환에 실패했습니다"))
                        .toList();

        // 모든 항목의 답변이 stt변환에 실패했을 때
        if(interviewQuestionAndAnswerRequestDto.isEmpty()){
            return;
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

            String jsonFeedbacks;
            try {
                jsonFeedbacks = new ObjectMapper().writeValueAsString(singleInterviewFeedback.getFollow_up_questions());
            } catch (JsonProcessingException e) {
                throw new RuntimeException("꼬리 질문 직렬화 실패", e);
            }

            interviewAnswers.get(singleInterviewFeedback.getInterview_answer_id()).addInterviewAnswerFeedback(singleInterviewFeedback.getFeedback());
            interviewAnswers.get(singleInterviewFeedback.getInterview_answer_id()).addInterviewFollowUpQuestion(jsonFeedbacks);
        }

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

}
