package com.ssafy.hellojob.domain.company.repository;

import com.ssafy.hellojob.domain.company.dto.CompanyListDto;
import com.ssafy.hellojob.domain.company.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    @Query("SELECT new com.ssafy.hellojob.domain.company.dto.CompanyListDto(c.id, c.companyName, c.companyLocation, c.companySize, c.companyIndustry, c.companyVisible, c.updatedAt) " +
            "FROM Company c")
    List<CompanyListDto> getAllCompany();

    @Query("SELECT new com.ssafy.hellojob.domain.company.dto.CompanyListDto(c.id, c.companyName, c.companyLocation, c.companySize, c.companyIndustry, c.companyVisible, c.updatedAt) " +
            "FROM Company c WHERE c.companyName LIKE CONCAT(:companyName, '%')")
    List<CompanyListDto> getCompanyByCompanyName(@Param("companyName") String companyName);


}
