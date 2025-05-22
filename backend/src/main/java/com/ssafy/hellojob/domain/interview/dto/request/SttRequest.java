package com.ssafy.hellojob.domain.interview.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SttRequest {
    private Integer interviewAnswerId;
    private byte[] fileBytes;
    private String originalFilename;
    private Integer userId;
}
