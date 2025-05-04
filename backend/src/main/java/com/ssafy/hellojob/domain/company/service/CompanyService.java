package com.ssafy.hellojob.domain.company.service;

import com.ssafy.hellojob.domain.company.dto.CompanyListDto;
import com.ssafy.hellojob.domain.company.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyService {

    @Autowired
    CompanyRepository companyRepository;

    public List<CompanyListDto> getAllCompany(){
        return companyRepository.getAllCompany();
    }

    public List<CompanyListDto> getCompanyByCompanyName(String companyName){
        return companyRepository.getCompanyByCompanyName(companyName);
    }

    public String getCompanyNameByCompanyId(Long companyId){
        return companyRepository.getCompanyNameByCompanyId(companyId);
    }

}
