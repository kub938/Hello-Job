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

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/interview")
public class InterviewController {

    private final InterviewService interviewService;
    private final S3UploadService s3UploadService;

    @GetMapping("/question/cs")
    public List<QuestionListResponseDto> csQuestionList(@AuthenticationPrincipal UserPrincipal userPrincipal){
        List<QuestionListResponseDto> responseDto = interviewService.getCsQuestionList(userPrincipal.getUserId());
        return responseDto;
    }

    @GetMapping("/question/personality")
    public List<QuestionListResponseDto> personalityQuestionList(@AuthenticationPrincipal UserPrincipal userPrincipal){
        List<QuestionListResponseDto> responseDto = interviewService.getPersonalityQuestionList(userPrincipal.getUserId());
        return responseDto;
    }

    @GetMapping("/question/cover-letter/{coverLetterId}")
    public List<QuestionListResponseDto> coverLetterQuestionList(@PathVariable("coverLetterId") Integer coverLetterId,
                                                                 @AuthenticationPrincipal UserPrincipal userPrincipal){
        List<QuestionListResponseDto> responseDto = interviewService.getCoverLetterQuestionList(coverLetterId, userPrincipal.getUserId());
        return responseDto;
    }

    @PostMapping("/select/cs")
    public SelectInterviewStartResponseDto startCsSelectInterview(@AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.startCsSelectInterview(userPrincipal.getUserId());
    }

    @PostMapping("/select/personality")
    public SelectInterviewStartResponseDto startPersonalitySelectInterview(@AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.startPersonalitySelectInterview(userPrincipal.getUserId());
    }

    @PostMapping("/select/cover-letter")
    public SelectInterviewStartResponseDto startCoverLetterSelectInterview(@RequestBody StartCoverLetterInterviewRequestDto requestDto,
                                                                           @AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.startCoverLetterSelectInterview(requestDto.getCoverLetterId(), userPrincipal.getUserId());
    }

    @PostMapping("/cs")
    public InterviewStartResponseDto startCsRandomInterview(@AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.startCsRandomInterview(userPrincipal.getUserId());
    }

    @PostMapping("/personality")
    public InterviewStartResponseDto startPersonalityRandomInterview(@AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.startPersonalityRandomInterview(userPrincipal.getUserId());
    }

    @PostMapping("/cover-letter")
    public InterviewStartResponseDto startCoverLetterRandomInterview(@RequestBody StartCoverLetterInterviewRequestDto requestDto,
                                                                     @AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.startCoverLetterRandomInterview(requestDto.getCoverLetterId(), userPrincipal.getUserId());
    }

    @PostMapping("/practice/question/cs")
    public void selectCsQuestion(@RequestBody SelectQuestionRequestDto requestDto,
                                 @AuthenticationPrincipal UserPrincipal userPrincipal){
        interviewService.saveCsQuestions(userPrincipal.getUserId(), requestDto);
    }

    @PostMapping("/practice/question/personality")
    public void selectPersonalityQuestion(@RequestBody SelectQuestionRequestDto requestDto,
                                 @AuthenticationPrincipal UserPrincipal userPrincipal){
        interviewService.savePersonalityQuestions(userPrincipal.getUserId(), requestDto);
    }

    @PostMapping("/practice/question/cover-letter")
    public void selectCoverLetterQuestion(@RequestBody SelectQuestionRequestDto requestDto,
                                          @AuthenticationPrincipal UserPrincipal userPrincipal){
        interviewService.saveCoverLetterQuestions(userPrincipal.getUserId(), requestDto);
    }

    @PostMapping("/question/cover-letter/save")
    public CoverLetterQuestionSaveResponseDto saveNewCoverLetterQuestion(@RequestBody CoverLetterQuestionSaveRequestDto requestDto,
                                                                         @AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.saveNewCoverLetterQuestion(userPrincipal.getUserId(), requestDto);
    }

    @PostMapping("/question/memo")
    public WriteMemoResponseDto writeMemo(@RequestBody WriteMemoRequestDto requestDto, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return interviewService.createMemo(requestDto, userPrincipal.getUserId());
    }

    @PatchMapping("/question/{memoId}")
    public Map<String, String> modifyMemo(@RequestBody ModifyMemoRequestDto requestDto, @PathVariable Integer memoId, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return interviewService.updateMemo(requestDto.getMemo(), memoId, userPrincipal.getUserId());
    }

    @DeleteMapping("/question/{memoId}")
    public Map<String, String> deleteMemo(@PathVariable Integer memoId, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return interviewService.deleteMemo(memoId, userPrincipal.getUserId());
    }

    @PostMapping("/practice/voice")
    public void stopVoiceRecoding(@RequestPart("interviewInfo") InterviewInfo interviewInfo,
                                  @RequestPart("audioFile") MultipartFile audioFile,
                                  @AuthenticationPrincipal UserPrincipal userPrincipal) throws Exception {

        String result = interviewService.transcribeAudio(audioFile);
        interviewService.saveInterviewAnswer(userPrincipal.getUserId(), result, interviewInfo);
    }

    @PostMapping("/question/cover-letter")
    public CreateCoverLetterQuestionResponseDto createCoverLetterQuestion(@RequestBody CoverLetterIdRequestDto coverLetterIdRequestDto,
                                                                          @AuthenticationPrincipal UserPrincipal userPrincipal){
        return interviewService.createCoverLetterQuestion(userPrincipal.getUserId(), coverLetterIdRequestDto);
    }

    @PostMapping("/practice/video")
    public void endInterview(@RequestPart("videoFile") MultipartFile videoFile,
                             @RequestPart("videoInfo") VideoInfo videoInfo,
                             @AuthenticationPrincipal UserPrincipal userPrincipal) throws IOException {

        String url = s3UploadService.uploadVideo(videoFile);
        interviewService.endInterview(userPrincipal.getUserId(), url, videoInfo);
    }

}
