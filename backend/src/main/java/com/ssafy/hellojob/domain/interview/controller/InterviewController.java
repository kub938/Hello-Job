package com.ssafy.hellojob.domain.interview.controller;

import com.ssafy.hellojob.domain.interview.dto.response.QuestionListResponseDto;
import com.ssafy.hellojob.domain.interview.service.InterviewService;
import com.ssafy.hellojob.global.auth.token.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/interview")
public class InterviewController {

    private final InterviewService interviewService;

    @GetMapping("/cs")
    public List<QuestionListResponseDto> csQuestionList(@AuthenticationPrincipal UserPrincipal userPrincipal){
        List<QuestionListResponseDto> responseDto = interviewService.getCsQuestionList(userPrincipal.getUserId());
        return responseDto;
    }

    @GetMapping("/personality")
    public List<QuestionListResponseDto> personalityQuestionList(@AuthenticationPrincipal UserPrincipal userPrincipal){
        List<QuestionListResponseDto> responseDto = interviewService.getPersonalityQuestionList(userPrincipal.getUserId());
        return responseDto;
    }

    @GetMapping("/cover-letter/{coverLetterInterviewId}")
    public List<QuestionListResponseDto> coverLetterQuestionList(@PathVariable("coverLetterInterviewId") Integer coverLetterInterviewId,
                                                                 @AuthenticationPrincipal UserPrincipal userPrincipal){
        List<QuestionListResponseDto> responseDto = interviewService.getCoverLetterQuestionList(coverLetterInterviewId, userPrincipal.getUserId());
        return responseDto;
    }

}
