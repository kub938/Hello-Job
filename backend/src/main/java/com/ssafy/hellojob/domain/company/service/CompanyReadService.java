package com.ssafy.hellojob.domain.company.service;

import com.ssafy.hellojob.domain.company.entity.Company;
import com.ssafy.hellojob.domain.company.repository.CompanyRepository;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompanyReadService {

    private final CompanyRepository companyRepository;

    public Company findCompanyByIdOrElseThrow(Integer companyId){
        return companyRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new BaseException(ErrorCode.COMPANY_NOT_FOUND));
    }
    public String getCompanyNameByCompanyId(Integer companyId){
        return  companyRepository.getCompanyNameByCompanyId(companyId)
                .orElseThrow(() -> new BaseException(ErrorCode.COMPANY_NOT_FOUND));
    }

}
