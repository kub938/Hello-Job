package com.ssafy.hellojob.domain.interview.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.hellojob.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.CompletableFuture;

import static com.ssafy.hellojob.global.exception.ErrorCode.STT_TRANSCRIBE_INTERRUPTED;
import static com.ssafy.hellojob.global.exception.ErrorCode.VIDEO_TOO_LARGE;

@Slf4j
@Service
@RequiredArgsConstructor
public class SttService {

    @Value("${OPENAI_API_URL}")
    private String openAiUrl;

    @Value("${OPENAI_API_KEY}")
    private String openAiKey;

    // stt
    @Async("taskExecutor")
    public CompletableFuture<String> transcribeAudio(byte[] fileBytes, String originalFilename) {

        if (fileBytes.length > 25 * 1024 * 1024) {
            throw new BaseException(VIDEO_TOO_LARGE);
        }

        Resource audioResource = new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() {
                return originalFilename;
            }
        };

        int maxRetries = 5;
        int attempt = 0;

        while (attempt < maxRetries) {
            try {
                RestTemplate restTemplate = new RestTemplate();

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
                    log.debug("stt 변환 성공");
                    String result = objectMapper.readTree(response.getBody()).get("text").asText();
                    return CompletableFuture.completedFuture(result);
                } else {
                    throw new RuntimeException("Whisper STT 응답 실패: " + response.getStatusCode());
                }

            } catch (Exception e) {
                attempt++;
                if (attempt >= maxRetries) {
                    return CompletableFuture.completedFuture("stt 변환에 실패했습니다");
                }

                log.warn("⚠️ STT 변환 실패 - 재시도 중 ({}/{}): {}", attempt, maxRetries, e.getMessage());

                try {
                    Thread.sleep(1000L * attempt); // 점진적 대기: 1s, 2s, ...
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new BaseException(STT_TRANSCRIBE_INTERRUPTED);
                }
            }
        }

        return CompletableFuture.completedFuture("stt 변환에 실패했습니다");
    }



}
