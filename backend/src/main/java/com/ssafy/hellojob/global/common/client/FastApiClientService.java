package com.ssafy.hellojob.global.common.client;

import com.ssafy.hellojob.domain.companyanalysis.dto.CompanyAnalysisFastApiRequestDto;
import com.ssafy.hellojob.domain.companyanalysis.dto.CompanyAnalysisFastApiResponseDto;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class FastApiClientService {

    private final WebClient fastApiWebClient;

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

}
