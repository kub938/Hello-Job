package com.ssafy.hellojob.domain.coverletter.service;

import com.ssafy.hellojob.domain.companyanalysis.entity.SwotAnalysis;
import com.ssafy.hellojob.domain.coverletter.dto.ai.request.SWOTDto;
import com.ssafy.hellojob.domain.coverletter.entity.CoverLetter;
import com.ssafy.hellojob.global.util.JsonUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class CoverLetterSwotService {

    private final JsonUtil jsonUtil;

    public SWOTDto getSWOTDto(CoverLetter coverLetter) {
        SwotAnalysis swotAnalysis = coverLetter.getCompanyAnalysis().getSwotAnalysis();
        if (swotAnalysis == null)
            return SWOTDto.from(new ArrayList<>(), new ArrayList<>(), new ArrayList<>(), new ArrayList<>(), "");

        return SWOTDto.from(
                jsonUtil.parseStringList(swotAnalysis.getStrengthsContent()),
                jsonUtil.parseStringList(swotAnalysis.getWeaknessesContent()),
                jsonUtil.parseStringList(swotAnalysis.getOpportunitiesContent()),
                jsonUtil.parseStringList(swotAnalysis.getThreatsContent()),
                swotAnalysis.getSwotSummary());
    }
}
