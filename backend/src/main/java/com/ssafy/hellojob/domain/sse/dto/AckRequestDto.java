package com.ssafy.hellojob.domain.sse.dto;

import lombok.Getter;

@Getter
public class AckRequestDto {
    private String eventName;
    private String dataJson;
}
