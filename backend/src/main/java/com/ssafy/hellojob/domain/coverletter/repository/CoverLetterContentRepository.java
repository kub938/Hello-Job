package com.ssafy.hellojob.domain.coverletter.repository;

import com.ssafy.hellojob.domain.coverletter.entity.CoverLetterContent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoverLetterContentRepository extends JpaRepository<CoverLetterContent, Integer> {
}
