package com.ssafy.hellojob.domain.jobroleanalysis.service;

import com.ssafy.hellojob.domain.company.repository.CompanyRepository;
import com.ssafy.hellojob.domain.jobroleanalysis.dto.*;
import com.ssafy.hellojob.domain.jobroleanalysis.entity.JobRoleAnalysis;
import com.ssafy.hellojob.domain.jobroleanalysis.entity.JobRoleAnalysisBookmark;
import com.ssafy.hellojob.domain.jobroleanalysis.repository.JobRoleAnalysisBookmarkRepository;
import com.ssafy.hellojob.domain.jobroleanalysis.repository.JobRoleAnalysisRepository;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.domain.user.repository.UserRepository;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class JobRoleAnalysisService {

    @Autowired
    JobRoleAnalysisRepository jobRoleAnalysisRepository;

    @Autowired
    JobRoleAnalysisBookmarkRepository jobRoleAnalysisBookmarkRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    CompanyRepository companyRepository;

    public JobRoleAnalysisSaveResponseDto createJobRoleAnalysis(Integer userId, JobRoleAnalysisSaveRequestDto requestDto){

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        JobRoleAnalysis newJobRoleAnalysis = JobRoleAnalysis.builder()
                .user(user)
                .companyId(requestDto.getCompanyId())
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

    @Transactional
    public JobRoleAnalysisDetailResponseDto searchJobRoleAnalysis(Integer userId, Long jobRoleAnalysisId) {
        JobRoleAnalysis jobRoleAnalysis = jobRoleAnalysisRepository.findById(jobRoleAnalysisId)
                .orElseThrow(() -> new BaseException(ErrorCode.BAD_REQUEST_ERROR));

        // 1. 회사명 조회
        String companyName = companyRepository.getCompanyNameByCompanyId(jobRoleAnalysis.getCompanyId());

        // 2. 현재 로그인한 유저가 이거 북마크했는지 여부 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
        boolean isBookmarked = jobRoleAnalysisBookmarkRepository.existsByUserAndJobRoleAnalysis(user, jobRoleAnalysis);

        // 🔥 3. 조회수 +1
        jobRoleAnalysis.setJobRoleViewCount(jobRoleAnalysis.getJobRoleViewCount() + 1);
        jobRoleAnalysisRepository.save(jobRoleAnalysis); // 업데이트 반영


        // 4. ResponseDto에 담아서 리턴 (반영된 조회수로)
        return JobRoleAnalysisDetailResponseDto.builder()
                .jobRoleAnalysisId(jobRoleAnalysis.getJobRoleAnalysisId())
                .companyName(companyName)
                .jobRoleName(jobRoleAnalysis.getJobRoleName())
                .jobRoleAnalysisTitle(jobRoleAnalysis.getJobRoleTitle())
                .jobRoleSkills(jobRoleAnalysis.getJobRoleSkills())
                .jobRoleRequirements(jobRoleAnalysis.getJobRoleRequirements())
                .jobRolePreferences(jobRoleAnalysis.getJobRolePreferences())
                .jobRoleEtc(jobRoleAnalysis.getJobRoleEtc())
                .jobRoleViewCount(jobRoleAnalysis.getJobRoleViewCount())
                .isPublic(jobRoleAnalysis.getIsPublic())
                .jobRoleCategory(jobRoleAnalysis.getJobRoleCategory())
                .updatedAt(jobRoleAnalysis.getUpdatedAt())
                .jobRoleAnalysisBookmarkCount(jobRoleAnalysis.getJobRoleBookmarkCount())
                .bookmark(isBookmarked)
                .build();
    }



    public JobRoleAnalysisBookmarkSaveResponseDto addJobRoleBookmark(Integer userId, JobRoleAnalysisBookmarkSaveRequestDto requestDto) {

        JobRoleAnalysis jobRoleAnalysis = jobRoleAnalysisRepository.findById(requestDto.getJobRoleAnalysisId())
                .orElseThrow(() -> new BaseException(ErrorCode.BAD_REQUEST_ERROR));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        boolean alreadyBookmarked = jobRoleAnalysisBookmarkRepository.existsByUserAndJobRoleAnalysis(user, jobRoleAnalysis);
        if (alreadyBookmarked) {
            JobRoleAnalysisBookmark existingBookmark = jobRoleAnalysisBookmarkRepository.findByUserAndJobRoleAnalysis(user, jobRoleAnalysis)
                    .orElseThrow(() -> new BaseException(ErrorCode.BAD_REQUEST_ERROR));
            return JobRoleAnalysisBookmarkSaveResponseDto.builder()
                    .jobRoleAnalysisBookmarkId(existingBookmark.getJobRoleAnalysisBookmarkId())
                    .jobRoleAnalysisId(jobRoleAnalysis.getJobRoleAnalysisId())
                    .build();
        }

        JobRoleAnalysisBookmark newJobRoleAnalysisBookmark = JobRoleAnalysisBookmark.builder()
                .user(user)
                .jobRoleAnalysis(jobRoleAnalysis)
                .build();

        jobRoleAnalysisBookmarkRepository.save(newJobRoleAnalysisBookmark);

        jobRoleAnalysis.setJobRoleBookmarkCount(jobRoleAnalysis.getJobRoleBookmarkCount() + 1);
        jobRoleAnalysisRepository.save(jobRoleAnalysis);

        return JobRoleAnalysisBookmarkSaveResponseDto.builder()
                .jobRoleAnalysisBookmarkId(newJobRoleAnalysisBookmark.getJobRoleAnalysisBookmarkId())
                .jobRoleAnalysisId(requestDto.getJobRoleAnalysisId())
                .build();
    }

    @Transactional
    public void deleteJobRoleBookmark(Long jobRoleAnalysisBookmarkId) {
        // 1. 북마크 조회
        JobRoleAnalysisBookmark bookmark = jobRoleAnalysisBookmarkRepository.findById(jobRoleAnalysisBookmarkId)
                .orElseThrow(() -> new BaseException(ErrorCode.BAD_REQUEST_ERROR));

        // 2. 북마크가 가리키는 JobRoleAnalysis 가져오기
        JobRoleAnalysis jobRoleAnalysis = bookmark.getJobRoleAnalysis();

        // 3. 북마크 삭제
        jobRoleAnalysisBookmarkRepository.delete(bookmark);

        // 4. JobRoleAnalysis의 북마크 카운트 -1
        jobRoleAnalysis.setJobRoleBookmarkCount(jobRoleAnalysis.getJobRoleBookmarkCount() - 1);
        jobRoleAnalysisRepository.save(jobRoleAnalysis);
    }

    // 해당 유저가 북마크한 모든 직무 분석 리스트 출력(마이페이지에서)
    @Transactional(readOnly = true)
    public List<JobRoleAnalysisListResponseDto> searchJobRoleAnalysisBookmarkList(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 1. 이 유저가 북마크한 모든 직무 분석 리스트 가져오기
        List<JobRoleAnalysisBookmark> bookmarkList = jobRoleAnalysisBookmarkRepository.findAllByUser(user);

        List<JobRoleAnalysisListResponseDto> result = new ArrayList<>();

        for (JobRoleAnalysisBookmark bookmark : bookmarkList) {
            JobRoleAnalysis jobRoleAnalysis = bookmark.getJobRoleAnalysis();

            // 2. 직무 분석이 '비공개'인 경우는 제외
            if (!jobRoleAnalysis.getIsPublic()) {
                continue;
            }

            // 3. 결과 리스트에 추가
            result.add(JobRoleAnalysisListResponseDto.builder()
                    .jobRoleAnalysisBookmarkId(bookmark.getJobRoleAnalysisBookmarkId())
                    .jobRoleAnalysisId(jobRoleAnalysis.getJobRoleAnalysisId())
                    .jobRoleName(jobRoleAnalysis.getJobRoleName())
                    .jobRoleAnalysisTitle(jobRoleAnalysis.getJobRoleTitle())
                    .jobRoleCategory(jobRoleAnalysis.getJobRoleCategory().name()) // enum을 문자열로
                    .isPublic(jobRoleAnalysis.getIsPublic())
                    .jobRoleViewCount(jobRoleAnalysis.getJobRoleViewCount())
                    .jobRoleBookmarkCount(jobRoleAnalysis.getJobRoleBookmarkCount())
                    .bookmark(true) // 북마크 목록이니까 무조건 true
                    .updatedAt(jobRoleAnalysis.getUpdatedAt())
                    .build());
        }

        return result;
    }

    // 유저가 북마크한 직무 분석 중 특정 기업에 대한 직무 분석 리스트 출력
    @Transactional(readOnly = true)
    public List<JobRoleAnalysisListResponseDto> searchJobRoleAnalysisBookmarkListWithCompanyId(Integer userId, Long companyId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 1. 이 유저가 북마크한 모든 직무 분석 리스트 가져오기
        List<JobRoleAnalysisBookmark> bookmarkList = jobRoleAnalysisBookmarkRepository.findByUserAndJobRoleAnalysis_CompanyId(user, companyId);

        List<JobRoleAnalysisListResponseDto> result = new ArrayList<>();

        for (JobRoleAnalysisBookmark bookmark : bookmarkList) {
            JobRoleAnalysis jobRoleAnalysis = bookmark.getJobRoleAnalysis();

            // 2. 직무 분석이 '비공개'인 경우는 제외
            if (!jobRoleAnalysis.getIsPublic()) {
                continue;
            }

            // 3. 결과 리스트에 추가
            result.add(JobRoleAnalysisListResponseDto.builder()
                    .jobRoleAnalysisBookmarkId(bookmark.getJobRoleAnalysisBookmarkId())
                    .jobRoleAnalysisId(jobRoleAnalysis.getJobRoleAnalysisId())
                    .jobRoleName(jobRoleAnalysis.getJobRoleName())
                    .jobRoleAnalysisTitle(jobRoleAnalysis.getJobRoleTitle())
                    .jobRoleCategory(jobRoleAnalysis.getJobRoleCategory().name()) // enum을 문자열로
                    .isPublic(jobRoleAnalysis.getIsPublic())
                    .jobRoleViewCount(jobRoleAnalysis.getJobRoleViewCount())
                    .jobRoleBookmarkCount(jobRoleAnalysis.getJobRoleBookmarkCount())
                    .bookmark(true) // 북마크 목록이니까 무조건 true
                    .updatedAt(jobRoleAnalysis.getUpdatedAt())
                    .build());
        }

        return result;
    }

    // 직무 분석 검색 함수
    @Transactional(readOnly = true)
    public List<JobRoleAnalysisSearchListResponseDto> searchJobRoleAnalysis(Integer userId, Long companyId, JobRoleAnalysisSearchCondition condition) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 1. 북마크 정보 조회
        List<JobRoleAnalysisBookmark> bookmarkList = jobRoleAnalysisBookmarkRepository.findAllByUser(user);

        // 북마크한 jobRoleAnalysisId만 따로 뽑아두자
        Set<Long> bookmarkedAnalysisIds = bookmarkList.stream()
                .map(bookmark -> bookmark.getJobRoleAnalysis().getJobRoleAnalysisId())
                .collect(Collectors.toSet());

        // 2. companyId로 소속된 모든 직무 분석 조회
        List<JobRoleAnalysis> jobRoleAnalysisList = jobRoleAnalysisRepository.findAll().stream()
                .filter(analysis -> analysis.getCompanyId().equals(companyId)) // companyId 일치
                .filter(JobRoleAnalysis::getIsPublic) // isPublic == true
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
                .collect(Collectors.toList());

        // 3. 결과를 변환
        List<JobRoleAnalysisSearchListResponseDto> result = new ArrayList<>();

        for (JobRoleAnalysis jobRoleAnalysis : jobRoleAnalysisList) {
            result.add(JobRoleAnalysisSearchListResponseDto.builder()
                    .jobRoleAnalysisId(jobRoleAnalysis.getJobRoleAnalysisId())
                    .jobRoleName(jobRoleAnalysis.getJobRoleName())
                    .jobRoleAnalysisTitle(jobRoleAnalysis.getJobRoleTitle())
                    .jobRoleCategory(jobRoleAnalysis.getJobRoleCategory().name()) // enum -> 문자열
                    .isPublic(jobRoleAnalysis.getIsPublic())
                    .jobRoleViewCount(jobRoleAnalysis.getJobRoleViewCount())
                    .jobRoleBookmarkCount(jobRoleAnalysis.getJobRoleBookmarkCount())
                    .bookmark(bookmarkedAnalysisIds.contains(jobRoleAnalysis.getJobRoleAnalysisId())) // 북마크 여부
                    .updatedAt(jobRoleAnalysis.getUpdatedAt())
                    .build());
        }

        return result;
    }

    public void deleteJobRoleAnalysis(Integer userId, Long jobRoleAnalysisId){

        JobRoleAnalysis jobRoleAnalysis = jobRoleAnalysisRepository.findById(jobRoleAnalysisId)
                .orElseThrow(() -> new BaseException(ErrorCode.BAD_REQUEST_ERROR));

        if(userId == jobRoleAnalysis.getUser().getUserId()){
            jobRoleAnalysisRepository.delete(jobRoleAnalysis);
        } else {
            throw new BaseException(ErrorCode.INVALID_USER);
        }
    }

    @Transactional
    public JobRoleAnalysisUpdateResponseDto updateJobRoleAnalysis(JobRoleAnalysisUpdateRequestDto requestDto, Integer userId) {

        // 2. 기존 엔티티 조회
        JobRoleAnalysis jobRoleAnalysis = jobRoleAnalysisRepository.findById(requestDto.getJobRoleAnalysisId())
                .orElseThrow(() -> new BaseException(ErrorCode.JOB_ROLE_ANALYSIS_NOT_FOUND));

        // 1. 요청한 유저가 수정하려는 데이터의 주인인지 검증
        Integer jobRoleAnalysisUserId = jobRoleAnalysisRepository.findUserIdByJobRoleAnalysisId(requestDto.getJobRoleAnalysisId());
        if (!userId.equals(jobRoleAnalysisUserId)) {
            throw new BaseException(ErrorCode.INVALID_USER);
        }



        // 3. 수정할 필드만 업데이트 (setter 또는 별도 update 메서드 이용)
        jobRoleAnalysis.update(requestDto);

        // 4. save() 필요 없음! → JPA의 dirty checking이 알아서 update 쳐줌

        // 5. 결과 반환
        return JobRoleAnalysisUpdateResponseDto.builder()
                .jobRoleAnalysisId(jobRoleAnalysis.getJobRoleAnalysisId())
                .build();
    }


}
