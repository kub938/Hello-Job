package com.ssafy.hellojob.global.common.client;

import com.ssafy.hellojob.domain.companyanalysis.dto.CompanyAnalysisFastApiRequestDto;
import com.ssafy.hellojob.domain.companyanalysis.dto.CompanyAnalysisFastApiResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class FastApiClientService {

    private final WebClient fastApiWebClient;

    public CompanyAnalysisFastApiResponseDto sendJobAnalysisToFastApi(CompanyAnalysisFastApiRequestDto requestDto) {
        return fastApiWebClient.post()
                .uri("/api/v1/ai/company-analysis") // FastAPI 서버의 POST 엔드포인트
                .bodyValue(requestDto)
                .retrieve()
                .bodyToMono(CompanyAnalysisFastApiResponseDto.class)
                .block();
    }
}
