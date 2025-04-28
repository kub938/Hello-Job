package com.ssafy.hellojob.domain.jobroleanalysis.dto;

import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class JobRoleAnalysisSaveResponseDto {

    private Long id;

    @Builder
    public JobRoleAnalysisSaveResponseDto(Long id){
        this.id = id;
    }

}
