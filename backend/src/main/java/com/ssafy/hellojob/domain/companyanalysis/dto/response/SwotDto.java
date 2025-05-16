package com.ssafy.hellojob.domain.companyanalysis.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SwotDto {

    private SwotDetailDto strengths;
    private SwotDetailDto weaknesses;
    private SwotDetailDto opportunities;
    private SwotDetailDto threats;
    private String swot_summary;

}
