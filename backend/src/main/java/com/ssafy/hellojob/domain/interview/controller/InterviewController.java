package com.ssafy.hellojob.domain.interview.controller;

import com.ssafy.hellojob.domain.interview.dto.request.*;
import com.ssafy.hellojob.domain.interview.dto.response.*;
import com.ssafy.hellojob.domain.interview.service.InterviewService;
import com.ssafy.hellojob.domain.interview.service.S3UploadService;
import com.ssafy.hellojob.global.auth.token.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/interview")
public class InterviewController {

    private final InterviewService interviewService;
    private final S3UploadService s3UploadService;

    // cs 질문 목록 조회
    @GetMapping("/question/cs")
    public List<QuestionListResponseDto> csQuestionList(@AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.getCsQuestionList(userPrincipal.getUserId());
    }

    @GetMapping("/question/cs/{questionId}")
    public QuestionDetailResponseDto csQuestionDetail(@PathVariable Integer questionId, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return interviewService.findCsQuestionDetail(questionId, userPrincipal.getUserId());
    }

    // 인성 질문 목록 조회
    @GetMapping("/question/personality")
    public List<QuestionListResponseDto> personalityQuestionList(@AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.getPersonalityQuestionList(userPrincipal.getUserId());
    }

    @GetMapping("/question/personality/{questionId}")
    public QuestionDetailResponseDto personalityQuestionDetail(@PathVariable Integer questionId, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return interviewService.findPersonalityQuestionDetail(questionId, userPrincipal.getUserId());
    }

    // 자소서 기반 질문 목록 조회
    @GetMapping("/question/cover-letter/{coverLetterId}")
    public List<QuestionListResponseDto> coverLetterQuestionList(@PathVariable("coverLetterId") Integer coverLetterId,
                                                                 @AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.getCoverLetterQuestionList(coverLetterId, userPrincipal.getUserId());
    }

    @GetMapping("/question/cover-letter/{coverLetterId}/{questionId}")
    public QuestionDetailResponseDto coverLetterQuestionDetail(@PathVariable Integer questionId, @PathVariable Integer coverLetterId, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return interviewService.findCoverLetterQuestionDetail(questionId, coverLetterId, userPrincipal.getUserId());
    }

    // 문항 카테고리 선택 cs
    @PostMapping("/select/cs")
    public SelectInterviewStartResponseDto startCsSelectInterview(@AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.startCsSelectInterview(userPrincipal.getUserId());
    }

    // 문항 카테고리 선택 인성
    @PostMapping("/select/personality")
    public SelectInterviewStartResponseDto startPersonalitySelectInterview(@AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.startPersonalitySelectInterview(userPrincipal.getUserId());
    }

    // 구현 폐기(문항 카테고리 선택 자소서)
    @PostMapping("/select/cover-letter")
    public SelectInterviewStartResponseDto startCoverLetterSelectInterview(@RequestBody StartCoverLetterInterviewRequestDto requestDto,
                                                                           @AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.startCoverLetterSelectInterview(requestDto.getCoverLetterId(), userPrincipal.getUserId());
    }

    // cs 모의 면접 시작
    @PostMapping("/cs")
    public InterviewStartResponseDto startCsRandomInterview(@AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.startCsRandomInterview(userPrincipal.getUserId());
    }

    // 인성 모의 면접 시작
    @PostMapping("/personality")
    public InterviewStartResponseDto startPersonalityRandomInterview(@AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.startPersonalityRandomInterview(userPrincipal.getUserId());
    }

    // 자소서 모의 면접 시작
    @PostMapping("/cover-letter")
    public InterviewStartResponseDto startCoverLetterRandomInterview(@RequestBody StartCoverLetterInterviewRequestDto requestDto,
                                                                     @AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.startCoverLetterRandomInterview(requestDto.getCoverLetterId(), userPrincipal.getUserId());
    }

    // 문항 선택 면접 cs 질문 선택
    @PostMapping("/practice/question/cs")
    public InterviewStartResponseDto selectCsQuestion(@RequestBody SelectQuestionRequestDto requestDto,
                                                      @AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.saveCsQuestions(userPrincipal.getUserId(), requestDto);
    }

    // 문항 선택 면접 인성 질문 선택
    @PostMapping("/practice/question/personality")
    public InterviewStartResponseDto selectPersonalityQuestion(@RequestBody SelectQuestionRequestDto requestDto,
                                                               @AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.savePersonalityQuestions(userPrincipal.getUserId(), requestDto);
    }

    // 문항 선택 면접 자소서 질문 선택
    @PostMapping("/practice/question/cover-letter")
    public InterviewStartResponseDto selectCoverLetterQuestion(@RequestBody SelectCoverLetterQuestionRequestDto requestDto,
                                                               @AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.saveCoverLetterQuestions(userPrincipal.getUserId(), requestDto);
    }

    // 자소서 기반으로 생성된 질문 저장
    @PostMapping("/question/cover-letter/save")
    public Map<String, String> saveNewCoverLetterQuestion(@RequestBody CoverLetterQuestionSaveRequestDto requestDto,
                                                          @AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.saveNewCoverLetterQuestion(userPrincipal.getUserId(), requestDto);
    }

    @PostMapping("/question/cs/memo")
    public WriteMemoResponseDto writeCsMemo(@RequestBody WriteMemoRequestDto requestDto, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return interviewService.createCsMemo(requestDto, userPrincipal.getUserId());
    }

    @PostMapping("/question/personality/memo")
    public WriteMemoResponseDto writePersonalityMemo(@RequestBody WriteMemoRequestDto requestDto, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return interviewService.createPersonalityMemo(requestDto, userPrincipal.getUserId());
    }

    @PostMapping("/question/cover-letter/{coverLetterId}/memo")
    public WriteMemoResponseDto writeCoverLetterMemo(@RequestBody WriteMemoRequestDto requestDto, @PathVariable Integer coverLetterId, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return interviewService.createCoverLetterMemo(requestDto, coverLetterId, userPrincipal.getUserId());
    }

    @PatchMapping("/question/{memoId}")
    public Map<String, String> modifyMemo(@RequestBody ModifyMemoRequestDto requestDto, @PathVariable Integer memoId, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return interviewService.updateMemo(requestDto.getMemo(), memoId, userPrincipal.getUserId());
    }

    @DeleteMapping("/question/{memoId}")
    public Map<String, String> deleteMemo(@PathVariable Integer memoId, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return interviewService.deleteMemo(memoId, userPrincipal.getUserId());
    }

    // 한 문항 종료
    @PostMapping("/practice/question")
    public void stopVoiceRecoding(@RequestPart("interviewInfo") InterviewInfo interviewInfo,
                                  @RequestPart("videoFile") MultipartFile videoFile,
                                  @RequestPart("audioFile") MultipartFile audioFile,
                                  @AuthenticationPrincipal UserPrincipal userPrincipal) throws Exception {
        String url = s3UploadService.uploadVideo(videoFile);
        String result = interviewService.transcribeAudio(audioFile);
        interviewService.saveInterviewAnswer(userPrincipal.getUserId(), url, result, interviewInfo, videoFile);
    }

    // fast API 자소서 기반 질문 생성
    @PostMapping("/question/cover-letter")
    public CreateCoverLetterQuestionResponseDto createCoverLetterQuestion(@RequestBody CoverLetterIdRequestDto coverLetterIdRequestDto,
                                                                          @AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.createCoverLetterQuestion(userPrincipal.getUserId(), coverLetterIdRequestDto);
    }

    // 면접 종료
    @PostMapping("/practice/end")
    public EndInterviewResponseDto endInterview(@RequestBody EndInterviewRequestDto videoInfo,
                                                @AuthenticationPrincipal UserPrincipal userPrincipal) throws InterruptedException {

        return interviewService.endInterview(userPrincipal.getUserId(), videoInfo);
    }

    // 면접 피드백 상세 조회
    @GetMapping("/feedback/{interviewVideoId}")
    public InterviewFeedbackResponseDto findInterviewFeedbackDetail(@PathVariable("interviewVideoId") Integer interviewVideoId,
                                                                    @AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.findInterviewFeedbackDetail(interviewVideoId, userPrincipal.getUserId());
    }

    @GetMapping
    public List<InterviewThumbNailResponseDto> findAllInterview(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return interviewService.findAllInterview(userPrincipal.getUserId());
    }

    @GetMapping("/{interviewVideoId}")
    public InterviewDetailResponseDto findInterviewDetail(@PathVariable Integer interviewVideoId, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return interviewService.findInterviewDetail(interviewVideoId, userPrincipal.getUserId());
    }

    @DeleteMapping("/{interviewVideoId}")
    public Map<String, String> deleteInterviewVideo(@PathVariable Integer interviewVideoId, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return interviewService.deleteInterviewVideo(interviewVideoId, userPrincipal.getUserId());
    }

}
