package com.ssafy.hellojob.domain.user.dto.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class CheckTokenResponseDto {

    private Integer token;

}
