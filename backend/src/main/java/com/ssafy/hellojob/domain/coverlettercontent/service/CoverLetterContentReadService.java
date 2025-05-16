package com.ssafy.hellojob.domain.coverlettercontent.service;

import com.ssafy.hellojob.domain.coverlettercontent.entity.CoverLetterContent;
import com.ssafy.hellojob.domain.coverlettercontent.repository.CoverLetterContentRepository;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CoverLetterContentReadService {

    private final CoverLetterContentRepository coverLetterContentRepository;

    public CoverLetterContent findCoverLetterContentByIdOrElseThrow(Integer contentId) {
        return coverLetterContentRepository.findById(contentId)
                .orElseThrow(() -> new BaseException(ErrorCode.COVER_LETTER_CONTENT_NOT_FOUND));
    }

    public void checkCoverLetterContentValidation(Integer userId, CoverLetterContent content) {
        if (!content.getCoverLetter().getUser().getUserId().equals(userId)) {
            throw new BaseException(ErrorCode.COVER_LETTER_MISMATCH);
        }
    }

}
