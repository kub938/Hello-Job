package com.ssafy.hellojob.domain.companyanalysis.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SwotDetailDto {

    private List<String> contents;
    private List<String> tags;

}
