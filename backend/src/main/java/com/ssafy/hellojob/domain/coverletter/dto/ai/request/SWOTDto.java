package com.ssafy.hellojob.domain.coverletter.dto.ai.request;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class SWOTDto {
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> opportunities;
    private List<String> threats;
    private String swot_summary;

    public static SWOTDto from(List<String> strengths, List<String> weaknesses, List<String> opportunities, List<String> threats, String summary) {
        return SWOTDto.builder()
                .strengths(strengths)
                .weaknesses(weaknesses)
                .opportunities(opportunities)
                .threats(threats)
                .swot_summary(summary)
                .build();
    }
}
