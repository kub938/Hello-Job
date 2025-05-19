package com.ssafy.hellojob.domain.jobroleanalysis.service;

import com.ssafy.hellojob.domain.company.entity.Company;
import com.ssafy.hellojob.domain.company.service.CompanyReadService;
import com.ssafy.hellojob.domain.jobroleanalysis.dto.request.JobRoleAnalysisBookmarkSaveRequestDto;
import com.ssafy.hellojob.domain.jobroleanalysis.dto.request.JobRoleAnalysisSaveRequestDto;
import com.ssafy.hellojob.domain.jobroleanalysis.dto.request.JobRoleAnalysisSearchCondition;
import com.ssafy.hellojob.domain.jobroleanalysis.dto.request.JobRoleAnalysisUpdateRequestDto;
import com.ssafy.hellojob.domain.jobroleanalysis.dto.response.*;
import com.ssafy.hellojob.domain.jobroleanalysis.entity.JobRoleAnalysis;
import com.ssafy.hellojob.domain.jobroleanalysis.entity.JobRoleAnalysisBookmark;
import com.ssafy.hellojob.domain.jobroleanalysis.repository.JobRoleAnalysisBookmarkRepository;
import com.ssafy.hellojob.domain.jobroleanalysis.repository.JobRoleAnalysisRepository;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.domain.user.service.UserReadService;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobRoleAnalysisService {

    private final JobRoleAnalysisRepository jobRoleAnalysisRepository;
    private final JobRoleAnalysisBookmarkRepository jobRoleAnalysisBookmarkRepository;
    private final UserReadService userReadService;
    private final CompanyReadService companyReadService;
    private final JobRoleAnalysisReadService jobRoleAnalysisReadService;

    // 직무 분석 데이터 저장
    @Transactional
    public JobRoleAnalysisSaveResponseDto createJobRoleAnalysis(Integer userId, JobRoleAnalysisSaveRequestDto requestDto){

        // 유저 정보 조회
        User user = userReadService.findUserByIdOrElseThrow(userId);

        // 기업 정보 조회
        Company company = companyReadService.findCompanyByIdOrElseThrow(requestDto.getCompanyId());

        // db에 저장할 객체 생성
        JobRoleAnalysis newJobRoleAnalysis = JobRoleAnalysis.builder()
                .user(user)
                .company(company)
                .jobRoleName(requestDto.getJobRoleName())
                .jobRoleTitle(requestDto.getJobRoleTitle())
                .jobRoleSkills(requestDto.getJobRoleSkills())
                .jobRoleWork(requestDto.getJobRoleWork())
                .jobRoleRequirements(requestDto.getJobRoleRequirements())
                .jobRolePreferences(requestDto.getJobRolePreferences())
                .jobRoleEtc(requestDto.getJobRoleEtc())
                .jobRoleCategory(requestDto.getJobRoleCategory())
                .jobRoleViewCount(0) // 신규 생성이니까 기본값
                .jobRoleBookmarkCount(0) // 신규 생성이니까 기본값
                .isPublic(requestDto.getIsPublic()) // 공개 여부
                .build();

        jobRoleAnalysisRepository.save(newJobRoleAnalysis);

        return JobRoleAnalysisSaveResponseDto.builder()
                .jobRoleAnalysisId(newJobRoleAnalysis.getJobRoleAnalysisId())
                .build();
    }

    // 직무 분석 상세 조회
    @Transactional
    public JobRoleAnalysisDetailResponseDto searchJobRoleAnalysis(Integer userId, Integer jobRoleAnalysisId) {

        // 유저 정보 조회
        User user = userReadService.findUserByIdOrElseThrow(userId);
        
        // 직무 분석 데이터 조회
        JobRoleAnalysis jobRoleAnalysis = jobRoleAnalysisReadService.findJobRoleAnalysisById(jobRoleAnalysisId);

        // 기업 정보 조회
        companyReadService.findCompanyByIdOrElseThrow(jobRoleAnalysis.getCompany().getCompanyId());

        // 기업명 조회
        String companyName = companyReadService.getCompanyNameByCompanyId(jobRoleAnalysis.getCompany().getCompanyId());

        // 현재 로그인한 유저가 이거 북마크했는지 여부 조회
        boolean isBookmarked = jobRoleAnalysisBookmarkRepository.existsByUserAndJobRoleAnalysis(user, jobRoleAnalysis);

        boolean isWrittenByMe = userId.equals(jobRoleAnalysis.getUser().getUserId());

        // 조회수 +1
        jobRoleAnalysis.setJobRoleViewCount(jobRoleAnalysis.getJobRoleViewCount() + 1);
        jobRoleAnalysisRepository.save(jobRoleAnalysis); // 업데이트 반영

        // ResponseDto에 담아서 리턴 (반영된 조회수로)
        return JobRoleAnalysisDetailResponseDto.builder()
                .jobRoleAnalysisId(jobRoleAnalysis.getJobRoleAnalysisId())
                .companyName(companyName)
                .jobRoleName(jobRoleAnalysis.getJobRoleName())
                .jobRoleAnalysisTitle(jobRoleAnalysis.getJobRoleTitle())
                .jobRoleWork(jobRoleAnalysis.getJobRoleWork())
                .jobRoleSkills(jobRoleAnalysis.getJobRoleSkills())
                .jobRoleRequirements(jobRoleAnalysis.getJobRoleRequirements())
                .jobRolePreferences(jobRoleAnalysis.getJobRolePreferences())
                .jobRoleEtc(jobRoleAnalysis.getJobRoleEtc())
                .jobRoleViewCount(jobRoleAnalysis.getJobRoleViewCount())
                .isPublic(jobRoleAnalysis.isPublic())
                .jobRoleCategory(jobRoleAnalysis.getJobRoleCategory())
                .createdAt(jobRoleAnalysis.getCreatedAt())
                .updatedAt(jobRoleAnalysis.getUpdatedAt())
                .jobRoleAnalysisBookmarkCount(jobRoleAnalysis.getJobRoleBookmarkCount())
                .bookmark(isBookmarked)
                .writtenByMe(isWrittenByMe)
                .build();
    }


    // 북마크 추가
    @Transactional
    public JobRoleAnalysisBookmarkSaveResponseDto addJobRoleBookmark(Integer userId, JobRoleAnalysisBookmarkSaveRequestDto requestDto) {
        
        // 유저 정보 조회
        User user = userReadService.findUserByIdOrElseThrow(userId);
        
        // 직무 분석 데이터 조회
        JobRoleAnalysis jobRoleAnalysis = jobRoleAnalysisReadService.findJobRoleAnalysisById(requestDto.getJobRoleAnalysisId());

        // 현재 로그인한 유저가 해당 직무 분석 데이터 북마크 했는지 확인
        boolean alreadyBookmarked = jobRoleAnalysisBookmarkRepository.existsByUserAndJobRoleAnalysis(user, jobRoleAnalysis);

        // 이미 북마크된 경우 기존에 저장되어 있던 정보 반환(에러 처리 X)
        if (alreadyBookmarked) {
            JobRoleAnalysisBookmark existingBookmark = jobRoleAnalysisReadService.findJobRoleBookmarkAnalysisByUserAndJobRoleAnalysis(user, jobRoleAnalysis);
            return JobRoleAnalysisBookmarkSaveResponseDto.builder()
                    .jobRoleAnalysisBookmarkId(existingBookmark.getJobRoleAnalysisBookmarkId())
                    .jobRoleAnalysisId(jobRoleAnalysis.getJobRoleAnalysisId())
                    .build();
        }

        // 북마크 안 되어 있는 경우 새로 저장
        JobRoleAnalysisBookmark newJobRoleAnalysisBookmark = JobRoleAnalysisBookmark.builder()
                .user(user)
                .jobRoleAnalysis(jobRoleAnalysis)
                .build();

        jobRoleAnalysisBookmarkRepository.save(newJobRoleAnalysisBookmark);

        // 해당 직무 분석 데이터에 북마크 수 +1
        jobRoleAnalysis.setJobRoleBookmarkCount(jobRoleAnalysis.getJobRoleBookmarkCount() + 1);
        jobRoleAnalysisRepository.save(jobRoleAnalysis);

        return JobRoleAnalysisBookmarkSaveResponseDto.builder()
                .jobRoleAnalysisBookmarkId(newJobRoleAnalysisBookmark.getJobRoleAnalysisBookmarkId())
                .jobRoleAnalysisId(requestDto.getJobRoleAnalysisId())
                .build();
    }

    // 북마크 삭제
    @Transactional
    public void deleteJobRoleBookmark(Integer jobRoleAnalysisId, Integer userId) {

        // 유저 조회
        User user = userReadService.findUserByIdOrElseThrow(userId);

        // 직무 분석 데이터 조회
        JobRoleAnalysis jobRoleAnalysis = jobRoleAnalysisReadService.findJobRoleAnalysisById(jobRoleAnalysisId);

        // 북마크 조회
        JobRoleAnalysisBookmark bookmark = jobRoleAnalysisReadService.findJobRoleBookmarkAnalysisByUserAndJobRoleAnalysis(user, jobRoleAnalysis);

        // 유저 아이디와 북마크에 저장된 유저 아이디가 같을 때 요청 실행
        if(userId.equals(bookmark.getUser().getUserId())){
            jobRoleAnalysisBookmarkRepository.delete(bookmark);
        } else {
            throw new BaseException(ErrorCode.INVALID_USER);
        }

        // 해당 직무 분석 데이터의 북마크 카운트 -1
        jobRoleAnalysis.setJobRoleBookmarkCount(jobRoleAnalysis.getJobRoleBookmarkCount() - 1);
        jobRoleAnalysisRepository.save(jobRoleAnalysis);
    }

    // 해당 유저가 북마크한 모든 직무 분석 리스트 출력(마이페이지에서)
    @Transactional(readOnly = true)
    public List<JobRoleAnalysisListResponseDto> searchJobRoleAnalysisBookmarkList(Integer userId) {
        
        // 유저 정보 조회
        User user = userReadService.findUserByIdOrElseThrow(userId);

        // 유저가 북마크한 모든 직무 분석 리스트 가져오기
        List<JobRoleAnalysisBookmark> bookmarkList = jobRoleAnalysisBookmarkRepository.findAllByUser(user);

        // 결과값 반환할 객체 배열 생성
        List<JobRoleAnalysisListResponseDto> result = new ArrayList<>();

        for (JobRoleAnalysisBookmark bookmark : bookmarkList) {
            JobRoleAnalysis jobRoleAnalysis = bookmark.getJobRoleAnalysis();

            // 직무 분석이 '비공개'인 경우는 제외
            if (!jobRoleAnalysis.isPublic() && !userId.equals(jobRoleAnalysis.getUser().getUserId())) {
                continue;
            }

            result.add(JobRoleAnalysisListResponseDto.builder()
                    .jobRoleAnalysisBookmarkId(bookmark.getJobRoleAnalysisBookmarkId())
                    .jobRoleAnalysisId(jobRoleAnalysis.getJobRoleAnalysisId())
                    .companyName(companyReadService.getCompanyNameByCompanyId(jobRoleAnalysis.getCompany().getCompanyId()))
                    .jobRoleName(jobRoleAnalysis.getJobRoleName())
                    .jobRoleAnalysisTitle(jobRoleAnalysis.getJobRoleTitle())
                    .jobRoleCategory(jobRoleAnalysis.getJobRoleCategory().name()) // enum을 문자열로
                    .isPublic(jobRoleAnalysis.isPublic())
                    .jobRoleViewCount(jobRoleAnalysis.getJobRoleViewCount())
                    .jobRoleBookmarkCount(jobRoleAnalysis.getJobRoleBookmarkCount())
                    .bookmark(true) // 북마크 목록이니까 무조건 true
                    .updatedAt(jobRoleAnalysis.getUpdatedAt())
                    .createdAt(jobRoleAnalysis.getCreatedAt())
                    .build());
        }

        return result;
    }

    // 유저가 북마크한 직무 분석 중 특정 기업에 대한 직무 분석 리스트 출력
    @Transactional(readOnly = true)
    public List<JobRoleAnalysisListResponseDto> searchJobRoleAnalysisBookmarkListWithCompanyId(Integer userId, Integer companyId) {

        // 유저 정보 조회
        User user = userReadService.findUserByIdOrElseThrow(userId);

        // 기업 정보 조회
        companyReadService.findCompanyByIdOrElseThrow(companyId);

        // 이 유저가 북마크한 모든 직무 분석 리스트 가져오기
        List<JobRoleAnalysisBookmark> bookmarkList = jobRoleAnalysisBookmarkRepository.findByUserAndJobRoleAnalysis_Company_CompanyId(user, companyId);

        // 결과값 저장할 객체 배열 생성
        List<JobRoleAnalysisListResponseDto> result = new ArrayList<>();

        for (JobRoleAnalysisBookmark bookmark : bookmarkList) {
            JobRoleAnalysis jobRoleAnalysis = bookmark.getJobRoleAnalysis();

            // 직무 분석이 '비공개'인 경우는 제외
            if (!jobRoleAnalysis.isPublic() && !userId.equals(jobRoleAnalysis.getUser().getUserId())) {
                continue;
            }

            result.add(JobRoleAnalysisListResponseDto.builder()
                    .jobRoleAnalysisBookmarkId(bookmark.getJobRoleAnalysisBookmarkId())
                    .jobRoleAnalysisId(jobRoleAnalysis.getJobRoleAnalysisId())
                    .companyName(companyReadService.getCompanyNameByCompanyId(companyId))
                    .jobRoleName(jobRoleAnalysis.getJobRoleName())
                    .jobRoleAnalysisTitle(jobRoleAnalysis.getJobRoleTitle())
                    .jobRoleCategory(jobRoleAnalysis.getJobRoleCategory().name()) // enum을 문자열로
                    .isPublic(jobRoleAnalysis.isPublic())
                    .jobRoleViewCount(jobRoleAnalysis.getJobRoleViewCount())
                    .jobRoleBookmarkCount(jobRoleAnalysis.getJobRoleBookmarkCount())
                    .bookmark(true) // 북마크 목록이니까 무조건 true
                    .updatedAt(jobRoleAnalysis.getUpdatedAt())
                    .createdAt(jobRoleAnalysis.getCreatedAt())
                    .build());
        }

        return result;
    }

    // 직무 분석 검색 함수
    @Transactional(readOnly = true)
    public List<JobRoleAnalysisSearchListResponseDto> searchJobRoleAnalysis(Integer userId, Integer companyId, JobRoleAnalysisSearchCondition condition) {

        // 유저 정보 조회
        User user = userReadService.findUserByIdOrElseThrow(userId);

        // 기업 정보 조회
        companyReadService.findCompanyByIdOrElseThrow(companyId);

        // 이 유저의 북마크 정보 조회
        List<JobRoleAnalysisBookmark> bookmarkList = jobRoleAnalysisBookmarkRepository.findAllByUser(user);

        // 북마크한 jobRoleAnalysisId 별도 관리
        Set<Integer> bookmarkedAnalysisIds = bookmarkList.stream()
                .map(bookmark -> bookmark.getJobRoleAnalysis().getJobRoleAnalysisId())
                .collect(Collectors.toSet());

        // companyId로 소속된 모든 직무 분석 조회
        List<JobRoleAnalysis> jobRoleAnalysisList = jobRoleAnalysisRepository.findAll().stream()
                .filter(analysis -> analysis.getCompany().getCompanyId().equals(companyId)) // companyId 일치
                .filter(analysis ->
                        analysis.isPublic() || analysis.getUser().getUserId().equals(userId))
                .filter(analysis -> {
                    if (condition.getJobRoleName() != null && !condition.getJobRoleName().isEmpty()) {
                        return analysis.getJobRoleName().startsWith(condition.getJobRoleName()); // jobRoleName이 시작하는 경우
                    }
                    return true; // 조건 없으면 통과
                })
                .filter(analysis -> {
                    if (condition.getJobRoleTitle() != null && !condition.getJobRoleTitle().isEmpty()) {
                        return analysis.getJobRoleTitle().startsWith(condition.getJobRoleTitle()); // jobRoleTitle이 시작하는 경우
                    }
                    return true; // 조건 없으면 통과
                })
                .filter(analysis -> {
                    if (condition.getJobRoleCategory() != null) {
                        return analysis.getJobRoleCategory() == condition.getJobRoleCategory(); // 카테고리 정확 매칭
                    }
                    return true; // 조건 없으면 통과
                })
                .sorted(Comparator.comparing(JobRoleAnalysis::getUpdatedAt).reversed()) // 최신순 정렬
                .limit(10) // 최대 10개만
                .toList();

        // 3. 결과를 변환
        List<JobRoleAnalysisSearchListResponseDto> result = new ArrayList<>();

        for (JobRoleAnalysis jobRoleAnalysis : jobRoleAnalysisList) {
            result.add(JobRoleAnalysisSearchListResponseDto.builder()
                    .jobRoleAnalysisId(jobRoleAnalysis.getJobRoleAnalysisId())
                    .companyName(companyReadService.getCompanyNameByCompanyId(companyId))
                    .jobRoleName(jobRoleAnalysis.getJobRoleName())
                    .jobRoleAnalysisTitle(jobRoleAnalysis.getJobRoleTitle())
                    .jobRoleCategory(jobRoleAnalysis.getJobRoleCategory().name()) // enum -> 문자열
                    .isPublic(jobRoleAnalysis.isPublic())
                    .jobRoleViewCount(jobRoleAnalysis.getJobRoleViewCount())
                    .jobRoleBookmarkCount(jobRoleAnalysis.getJobRoleBookmarkCount())
                    .bookmark(bookmarkedAnalysisIds.contains(jobRoleAnalysis.getJobRoleAnalysisId())) // 북마크 여부
                    .updatedAt(jobRoleAnalysis.getUpdatedAt())
                    .createdAt(jobRoleAnalysis.getCreatedAt())
                    .build());
        }

        return result;
    }

    // 유저가 작성한 직무 분석 데이터 조회
    @Transactional(readOnly = true)
    public List<JobRoleAnalysisSearchListResponseDto> searchJobRoleAnalysisByUserId(Integer userId) {

        // 유저 조회
        User user = userReadService.findUserByIdOrElseThrow(userId);

        // 북마크 정보 조회
        List<JobRoleAnalysisBookmark> bookmarkList = jobRoleAnalysisBookmarkRepository.findAllByUser(user);

        // 북마크한 jobRoleAnalysisId만 따로 뽑아두기
        Set<Integer> bookmarkedAnalysisIds = bookmarkList.stream()
                .map(bookmark -> bookmark.getJobRoleAnalysis().getJobRoleAnalysisId())
                .collect(Collectors.toSet());

        // userId 기반 직무 분석 데이터 조회
        List<JobRoleAnalysis> jobRoleAnalysisList = jobRoleAnalysisRepository.findAll().stream()
                .filter(analysis -> userId.equals(analysis.getUser().getUserId()))
                .toList();

        // 결과를 변환
        List<JobRoleAnalysisSearchListResponseDto> result = new ArrayList<>();

        for (JobRoleAnalysis jobRoleAnalysis : jobRoleAnalysisList) {
            result.add(JobRoleAnalysisSearchListResponseDto.builder()
                    .jobRoleAnalysisId(jobRoleAnalysis.getJobRoleAnalysisId())
                    .jobRoleName(jobRoleAnalysis.getJobRoleName())
                    .jobRoleAnalysisTitle(jobRoleAnalysis.getJobRoleTitle())
                    .jobRoleCategory(jobRoleAnalysis.getJobRoleCategory().name()) // enum -> 문자열
                    .isPublic(jobRoleAnalysis.isPublic())
                    .jobRoleViewCount(jobRoleAnalysis.getJobRoleViewCount())
                    .jobRoleBookmarkCount(jobRoleAnalysis.getJobRoleBookmarkCount())
                    .bookmark(bookmarkedAnalysisIds.contains(jobRoleAnalysis.getJobRoleAnalysisId())) // 북마크 여부
                    .updatedAt(jobRoleAnalysis.getUpdatedAt())
                    .build());
        }

        return result;
    }

    // 직무 분석 데이터 삭제
    @Transactional
    public void deleteJobRoleAnalysis(Integer userId, Integer jobRoleAnalysisId){

        // 유저 조회
        userReadService.findUserByIdOrElseThrow(userId);

        // 직무 분석 데이터 조회
        JobRoleAnalysis jobRoleAnalysis = jobRoleAnalysisReadService.findJobRoleAnalysisById(jobRoleAnalysisId);

        // 작성자와 userId가 같을 때만 삭제
        if(userId.equals(jobRoleAnalysis.getUser().getUserId())){
            jobRoleAnalysisRepository.delete(jobRoleAnalysis);
        } else {
            throw new BaseException(ErrorCode.INVALID_USER);
        }
    }

    // 직무 분석 수정
    @Transactional
    public JobRoleAnalysisUpdateResponseDto updateJobRoleAnalysis(JobRoleAnalysisUpdateRequestDto requestDto, Integer userId) {

        // 유저 정보 조회
        userReadService.findUserByIdOrElseThrow(userId);

        // 기업 정보 조회
        companyReadService.findCompanyByIdOrElseThrow(requestDto.getCompanyId());

        // 직무 분석 정보 조회
        JobRoleAnalysis jobRoleAnalysis = jobRoleAnalysisReadService.findJobRoleAnalysisById(requestDto.getJobRoleAnalysisId());

        // 작성자와 userId 다를 경우 처리
        if (!userId.equals(jobRoleAnalysis.getUser().getUserId())) {
            throw new BaseException(ErrorCode.INVALID_USER);
        }

        // 직무 분석 정보 수정
        jobRoleAnalysis.update(requestDto);

        return JobRoleAnalysisUpdateResponseDto.builder()
                .jobRoleAnalysisId(jobRoleAnalysis.getJobRoleAnalysisId())
                .build();
    }


}
