package com.ssafy.hellojob.domain.company.service;

import com.ssafy.hellojob.domain.company.dto.CompanyDto;
import com.ssafy.hellojob.domain.company.dto.CompanyListDto;
import com.ssafy.hellojob.domain.company.entity.Company;
import com.ssafy.hellojob.domain.company.repository.CompanyRepository;
import com.ssafy.hellojob.domain.user.service.UserReadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyService {

    private final UserReadService userReadService;
    private final CompanyRepository companyRepository;
    private final CompanyReadService companyReadService;

    public List<CompanyListDto> getAllCompany(){
        return companyRepository.getAllCompany();
    }

    public List<CompanyListDto> getCompanyByCompanyName(String companyName){
        return companyRepository.getCompanyByCompanyName(companyName);
    }

    public CompanyDto getCompanyByCompanyId(Integer userId, Integer companyId){
        userReadService.findUserByIdOrElseThrow(userId);
        Company company = companyReadService.findCompanyByIdOrElseThrow(companyId);

        CompanyDto result = CompanyDto.builder()
                .id(companyId)
                .companyName(company.getCompanyName())
                .companyIndustry(company.getCompanyIndustry())
                .companyLocation(company.getCompanyLocation())
                .companySize(company.getCompanySize())
                .updatedAt(company.getUpdatedAt())
                .build();

        return result;
    }

}
