package com.ssafy.hellojob.domain.interview.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class WriteMemoResponseDto {
    private Integer memoId;
    private String message;

    private WriteMemoResponseDto(Integer memoId) {
        this.memoId = memoId;
        this.message = "메모를 등록했습니다.";
    }

    public static WriteMemoResponseDto from(Integer memoId) {
        return new WriteMemoResponseDto(memoId);
    }
}
