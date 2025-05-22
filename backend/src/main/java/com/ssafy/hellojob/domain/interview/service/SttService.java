package com.ssafy.hellojob.domain.interview.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class SttService {

    private final InterviewReadService interviewReadService;


    @Value("${OPENAI_API_URL}")
    private String openAiUrl;

    @Value("${OPENAI_API_KEY}")
    private String openAiKey;

    public String transcribeAudioSync(Integer interviewAnswerId, byte[] fileBytes, String originalFilename) {
        try {
            if (fileBytes.length > 25 * 1024 * 1024) {
                return "stt 변환에 실패했습니다";
            }

            interviewReadService.findInterviewAnswerByIdOrElseThrow(interviewAnswerId);

            Resource audioResource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return originalFilename;
                }
            };

            RestTemplate restTemplate = createTimeoutRestTemplate();

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", audioResource);
            body.add("model", "gpt-4o-transcribe");
            body.add("language", "ko");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.setBearerAuth(openAiKey);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    openAiUrl, HttpMethod.POST, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode root = objectMapper.readTree(response.getBody());
                String text = root.has("text") && !root.get("text").isNull()
                        ? root.get("text").asText()
                        : "stt 변환에 실패했습니다";
                log.debug("😎 stt 변환 결과: {}", text);
                return text;
            } else {
                return "stt 변환에 실패했습니다";
            }

        } catch (Exception e) {
            log.warn("❗ STT 처리 실패", e);
            return "stt 변환에 실패했습니다";
        }
    }

    private RestTemplate createTimeoutRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);  // 연결 시도 최대 3초
        factory.setReadTimeout(20000);    // 응답 대기 최대 20초
        return new RestTemplate(factory);
    }



}
