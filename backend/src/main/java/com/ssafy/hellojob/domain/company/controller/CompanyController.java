package com.ssafy.hellojob.domain.company.controller;

import com.ssafy.hellojob.domain.company.dto.CompanyListDto;
import com.ssafy.hellojob.domain.company.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/company")
public class CompanyController {

    @Autowired
    CompanyService companyService;

    @GetMapping("/search")
    public ResponseEntity<?> getCompanyName(@RequestParam(value = "companyName", required = false) String companyName){
        List<CompanyListDto> result;

        if (companyName != null && !companyName.isEmpty()) {
            result = companyService.getCompanyByCompanyName(companyName);
        } else {
            result = companyService.getAllCompany();
        }

        if (result.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204 No Content
        } else {
            return ResponseEntity.ok(result); // 200 OK + 데이터
        }

    }



}
