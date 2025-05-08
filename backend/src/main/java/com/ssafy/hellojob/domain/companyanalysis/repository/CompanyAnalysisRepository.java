package com.ssafy.hellojob.domain.companyanalysis.repository;

import com.ssafy.hellojob.domain.companyanalysis.entity.CompanyAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyAnalysisRepository extends JpaRepository<CompanyAnalysis, Integer> {

    List<CompanyAnalysis> findAllByCompany_CompanyId(Integer companyId);

    // 최근 14개 반환
    List<CompanyAnalysis> findTop14ByCompany_CompanyIdAndIsPublicTrueOrderByCreatedAtDesc(Integer companyId);


}
