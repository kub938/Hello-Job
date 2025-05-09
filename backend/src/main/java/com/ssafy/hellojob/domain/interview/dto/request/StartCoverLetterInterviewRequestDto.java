package com.ssafy.hellojob.domain.interview.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StartCoverLetterInterviewRequestDto {

    @NotNull()
    private Integer coverLetterId;

}
