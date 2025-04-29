package com.ssafy.hellojob.domain.jobroleanalysis.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;

@Getter
public enum JobRoleCategory {
    서버_백엔드_개발자,
    프론트엔드_개발자,
    안드로이드_개발자,
    iOS_개발자,
    크로스플랫폼_앱개발자,
    게임_클라이언트_개발자,
    게임_서버_개발자,
    DBA,
    빅데이터_엔지니어,
    인공지능_머신러닝,
    devops_시스템_엔지니어,
    정보보안_침해대응,
    QA_엔지니어,
    개발_PM,
    HW_펌웨어개발,
    SW_솔루션,
    헬스테크,
    VR_AR_3D,
    블록체인,
    기술지원,
    기타;

    @JsonCreator
    public static JobRoleCategory from(String input) {
        if (input == null) {
            return null;
        }
        // 입력 문자열의 공백을 언더스코어로 변환해서 Enum 매칭
        String enumName = input.replace(" ", "_");
        return JobRoleCategory.valueOf(enumName);
    }
}
