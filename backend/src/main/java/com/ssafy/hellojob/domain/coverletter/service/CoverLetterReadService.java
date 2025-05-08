package com.ssafy.hellojob.domain.coverletter.service;

import com.ssafy.hellojob.domain.coverletter.entity.CoverLetter;
import com.ssafy.hellojob.domain.coverletter.repository.CoverLetterRepository;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CoverLetterReadService {

    private final CoverLetterRepository coverLetterRepository;

    public CoverLetter findCoverLetterByIdOrElseThrow(Integer coverLetterId) {
        return coverLetterRepository.findById(coverLetterId)
                .orElseThrow(() -> new BaseException(ErrorCode.COVER_LETTER_NOT_FOUND));
    }

    public void checkCoverLetterValidation(Integer userId, Integer coverLetterId) {
        CoverLetter coverLetter = findCoverLetterByIdOrElseThrow(coverLetterId);

        if (!coverLetter.getUser().getUserId().equals(userId)) {
            throw new BaseException(ErrorCode.COVER_LETTER_MISMATCH);
        }
    }
}
