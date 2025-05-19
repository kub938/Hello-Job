package com.ssafy.hellojob.global.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.hellojob.domain.coverlettercontent.dto.response.ChatMessageDto;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JsonUtil {

    private final ObjectMapper mapper;

    public List<String> parseString(String str) {
        if (str == null || str.isBlank()) return new ArrayList<>();
        try {
            return mapper.readValue(str, new TypeReference<>() {
            });
        } catch (JsonProcessingException e) {
            throw new BaseException(ErrorCode.DESERIALIZATION_FAIL);
        }
    }

    public String stringToJson(List<ChatMessageDto> messages) {
        try {
            return mapper.writeValueAsString(messages);
        } catch (JsonProcessingException e) {
            throw new BaseException(ErrorCode.SERIALIZATION_FAIL);
        }
    }

    // chatMessage JSON 형태로 파싱
    public List<ChatMessageDto> parseMessage(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return mapper.readValue(json, new TypeReference<>() {
            });
        } catch (JsonProcessingException e) {
            throw new BaseException(ErrorCode.DESERIALIZATION_FAIL);
        }
    }

    // String 형태로 직렬화
    public String messageToJson(List<ChatMessageDto> messages) {
        try {
            return mapper.writeValueAsString(messages);
        } catch (JsonProcessingException e) {
            throw new BaseException(ErrorCode.SERIALIZATION_FAIL);
        }
    }
}
