package com.ssafy.hellojob.global.common.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.hellojob.domain.companyanalysis.dto.request.CompanyAnalysisFastApiRequestDto;
import com.ssafy.hellojob.domain.companyanalysis.dto.response.CompanyAnalysisFastApiResponseDto;
import com.ssafy.hellojob.domain.coverletter.dto.ai.request.AICoverLetterRequestDto;
import com.ssafy.hellojob.domain.coverletter.dto.ai.response.AICoverLetterResponseDto;
import com.ssafy.hellojob.domain.coverletter.dto.ai.response.AICoverLetterResponseWrapperDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.ai.request.AIChatRequestDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.ai.response.AIChatResponseDto;
import com.ssafy.hellojob.domain.interview.dto.request.CreateCoverLetterFastAPIRequestDto;
import com.ssafy.hellojob.domain.interview.dto.request.InterviewFeedbackFastAPIRequestDto;
import com.ssafy.hellojob.domain.interview.dto.response.CreateCoverLetterFastAPIResponseDto;
import com.ssafy.hellojob.domain.interview.dto.response.InterviewFeedbackFastAPIResponseDto;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FastApiClientService {

    private final WebClient fastApiWebClient;
    private final ObjectMapper objectMapper;

    public CompanyAnalysisFastApiResponseDto sendJobAnalysisToFastApi(CompanyAnalysisFastApiRequestDto requestDto) {

        CompanyAnalysisFastApiResponseDto response = fastApiWebClient.post()
                .uri("/api/v1/ai/company-analysis")
                .bodyValue(requestDto)
                .retrieve()
                .bodyToMono(CompanyAnalysisFastApiResponseDto.class)
                .block();

        if (response == null) {
            throw new BaseException(ErrorCode.FASTAPI_RESPONSE_NULL);
        }

        return response;
    }

    public List<AICoverLetterResponseDto> getCoverLetterContentDetail(AICoverLetterRequestDto requestDto) {
        try {
            String json = objectMapper.writeValueAsString(requestDto);
            log.info("🚀 WebClient Request JSON: {}", json);
        } catch (Exception e) {
            log.error("❌ JSON 직렬화 실패", e);
        }

        AICoverLetterResponseWrapperDto responseWrapper = fastApiWebClient.post()
                .uri("/api/v1/ai/cover-letter")
                .bodyValue(requestDto)
                .retrieve()
                .bodyToMono(AICoverLetterResponseWrapperDto.class)
                .block();

        if (responseWrapper == null || responseWrapper.getCover_letters() == null) {
            throw new BaseException(ErrorCode.FASTAPI_RESPONSE_NULL);
        }

        List<AICoverLetterResponseDto> response = responseWrapper.getCover_letters();

        response.forEach(r -> log.debug("🌞 number: {}, detail: {}", r.getContent_number(), r.getCover_letter()));

        return response;
    }

    public AIChatResponseDto sendChatToFastApi(AIChatRequestDto requestDto) {
        try {
            String json = objectMapper.writeValueAsString(requestDto);
            log.info("🚀 WebClient Request JSON: {}", json);
        } catch (Exception e) {
            log.error("❌ JSON 직렬화 실패", e);
        }
        AIChatResponseDto response = fastApiWebClient.post()
                .uri("/api/v1/ai/cover-letter/edit")
                .bodyValue(requestDto)
                .retrieve()
                .bodyToMono(AIChatResponseDto.class)
                .block();

        if (response == null) {
            throw new BaseException(ErrorCode.FASTAPI_RESPONSE_NULL);
        }

        log.debug("🌞 AI 메시지: {}, 유저 메시지 {}", response.getAi_message(), response.getUser_message());

        return response;
    }

    public CreateCoverLetterFastAPIResponseDto sendCoverLetterToFastApi(CreateCoverLetterFastAPIRequestDto requestDto) {

        CreateCoverLetterFastAPIResponseDto response = fastApiWebClient.post()
                .uri("/api/v1/interview/question/cover-letter")
                .bodyValue(requestDto)
                .retrieve()
                .bodyToMono(CreateCoverLetterFastAPIResponseDto.class)
                .block();

        if (response == null) {
            throw new BaseException(ErrorCode.FASTAPI_RESPONSE_NULL);
        }

        log.debug("자소서 생성 요청 성공");
        log.debug("자소서 ID: {}, 질문 1: {}", response.getCover_letter_id(), response.getExpected_questions().get(0 ));

        return response;
    }

    public InterviewFeedbackFastAPIResponseDto sendInterviewAnswerToFastApi(InterviewFeedbackFastAPIRequestDto requestDto) {

        InterviewFeedbackFastAPIResponseDto response = fastApiWebClient.post()
                .uri("/api/v1/interview/question/cover-letter")
                .bodyValue(requestDto)
                .retrieve()
                .bodyToMono(InterviewFeedbackFastAPIResponseDto.class)
                .block();

        if (response == null) {
            throw new BaseException(ErrorCode.FASTAPI_RESPONSE_NULL);
        }

        log.debug("인터뷰 피드백 생성 요청 성공");
        return response;
    }

}
