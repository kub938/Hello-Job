package com.ssafy.hellojob.domain.sse.dto;

import lombok.Getter;

import java.util.Map;

@Getter
public class AckRequestDto {
    private String eventName;
    private Map<String, Object> data;
}
