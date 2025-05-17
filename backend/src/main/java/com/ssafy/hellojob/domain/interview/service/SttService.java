package com.ssafy.hellojob.domain.interview.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.hellojob.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

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
    public String transcribeAudio(MultipartFile audioFile) {

        if (audioFile.getSize() > 25 * 1024 * 1024) {
            throw new BaseException(VIDEO_TOO_LARGE);
        }

        int maxRetries = 5;
        int attempt = 0;

        while (attempt < maxRetries) {
            try {
                RestTemplate restTemplate = new RestTemplate();

                Resource audioResource = new ByteArrayResource(audioFile.getBytes()) {
                    @Override
                    public String getFilename() {
                        return audioFile.getOriginalFilename();
                    }
                };

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
                    return objectMapper.readTree(response.getBody()).get("text").asText();
                } else {
                    throw new RuntimeException("Whisper STT 응답 실패: " + response.getStatusCode());
                }

            } catch (Exception e) {
                attempt++;
                if (attempt >= maxRetries) {
                    return "stt 변환에 실패했습니다";
                }

                // 로그 출력 (선택)
                System.out.println("⚠️ STT 변환 실패 - 재시도 중 (" + attempt + "/" + maxRetries + "): " + e.getMessage());

                try {
                    Thread.sleep(1000L * (long) attempt); // 점진적 대기: 1s, 2s, ...
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new BaseException(STT_TRANSCRIBE_INTERRUPTED);
                }
            }
        }

        return "stt 변환에 실패했습니다";
    }


}
