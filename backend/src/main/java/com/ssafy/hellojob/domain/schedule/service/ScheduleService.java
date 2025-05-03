package com.ssafy.hellojob.domain.schedule.service;

import com.ssafy.hellojob.domain.coverletter.entity.CoverLetter;
import com.ssafy.hellojob.domain.coverletter.repository.CoverLetterRepository;
import com.ssafy.hellojob.domain.schedule.dto.request.ScheduleAddRequestDto;
import com.ssafy.hellojob.domain.schedule.dto.request.ScheduleUpdateScheduleCoverLetterRequestDto;
import com.ssafy.hellojob.domain.schedule.dto.request.ScheduleUpdateScheduleStatusRequestDto;
import com.ssafy.hellojob.domain.schedule.dto.response.ScheduleIdResponseDto;
import com.ssafy.hellojob.domain.schedule.dto.response.ScheduleListResponseDto;
import com.ssafy.hellojob.domain.schedule.entity.Schedule;
import com.ssafy.hellojob.domain.schedule.entity.ScheduleStatus;
import com.ssafy.hellojob.domain.schedule.entity.ScheduleStatusStep;
import com.ssafy.hellojob.domain.schedule.repository.ScheduleRepository;
import com.ssafy.hellojob.domain.schedule.repository.ScheduleStatusRepository;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.domain.user.repository.UserRepository;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;
    private final CoverLetterRepository coverLetterRepository;
    private final ScheduleStatusRepository scheduleStatusRepository;

    public ScheduleIdResponseDto addSchedule(ScheduleAddRequestDto requestDto, Integer userId){

        // 유저 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        ScheduleStatus scheduleStatus = scheduleStatusRepository.findByScheduleStatusName(requestDto.getScheduleStatusName());

        CoverLetter coverLetter = null;
        if(requestDto.getCoverLetterId() != null){
            coverLetter = coverLetterRepository.getReferenceById(requestDto.getCoverLetterId());
        }

        Schedule newSchedule = Schedule.builder()
                .user(user)
                .scheduleStatus(scheduleStatus)
                .coverLetter(coverLetter)
                .scheduleStartDate(requestDto.getScheduleStartDate())
                .scheduleEndDate(requestDto.getScheduleEndDate())
                .scheduleTitle(requestDto.getScheduleTitle())
                .scheduleMemo(requestDto.getScheduleMemo())
                .build();

        scheduleRepository.save(newSchedule);

        return new ScheduleIdResponseDto().builder()
                .scheduleId(newSchedule.getScheduleId())
                .build();

    }

    public void deleteSchedule(Long scheduleId, Integer userId){

        // 유저 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 스케줄 정보 조회
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new BaseException(ErrorCode.SCHEDULE_NOT_FOUND));

        // 작성자와 userId가 같을 때만 삭제
        if(userId == schedule.getUser().getUserId()){
            scheduleRepository.delete(schedule);
        } else {
            throw new BaseException(ErrorCode.INVALID_USER);
        }

    }

    public ScheduleIdResponseDto updateScheduleStatus(ScheduleUpdateScheduleStatusRequestDto requestDto, Long scheduleId, Integer userId){
        // 유저 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 스케줄 정보 조회
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new BaseException(ErrorCode.SCHEDULE_NOT_FOUND));

        // 권한 검증 (스케줄 소유자와 일치하는지 확인)
        if (!schedule.getUser().getUserId().equals(userId)) {
            throw new BaseException(ErrorCode.INVALID_USER);
        }

        // 새로운 상태 조회
        ScheduleStatus newStatus = scheduleStatusRepository.findByScheduleStatusName(requestDto.getScheduleStatusName());

        // 상태 변경
        schedule.setScheduleStatus(newStatus);
        scheduleRepository.save(schedule);

        // 저장
        return new ScheduleIdResponseDto(schedule.getScheduleId());

    }

    public ScheduleIdResponseDto updateScheduleCoverLetter(ScheduleUpdateScheduleCoverLetterRequestDto requestDto, Long scheduleId, Integer userId){
        // 유저 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 스케줄 정보 조회
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new BaseException(ErrorCode.SCHEDULE_NOT_FOUND));

        // 권한 검증 (스케줄 소유자와 일치하는지 확인)
        if (!schedule.getUser().getUserId().equals(userId)) {
            throw new BaseException(ErrorCode.INVALID_USER);
        }

        // 자기소개서 조회
        CoverLetter coverLetter = coverLetterRepository.getReferenceById(requestDto.getCoverLetterId());

        // 상태 변경
        schedule.setScheduleCoverLetter(coverLetter);
        scheduleRepository.save(schedule);

        // 저장
        return new ScheduleIdResponseDto(schedule.getScheduleId());

    }

    @Transactional
    public ScheduleIdResponseDto updateSchedule(ScheduleAddRequestDto requestDto, Long scheduleId, Integer userId) {
        // 유저 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 기존 스케줄 조회
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new BaseException(ErrorCode.SCHEDULE_NOT_FOUND));

        // 상태 값 수정
        ScheduleStatus status = scheduleStatusRepository.findByScheduleStatusName(requestDto.getScheduleStatusName());
        schedule.setScheduleStatus(status);

        // CoverLetter는 요청에 값이 있을 경우에만 수정
        if (requestDto.getCoverLetterId() != null) {
            CoverLetter coverLetter = coverLetterRepository.findById(requestDto.getCoverLetterId())
                    .orElseThrow(() -> new BaseException(ErrorCode.COVER_LETTER_NOT_FOUND));

            // 동일한 커버레터를 다시 설정하는 경우에는 생략
            if (schedule.getCoverLetter() == null || !schedule.getCoverLetter().getCoverLetterId().equals(coverLetter.getCoverLetterId())) {
                // 커버레터가 이미 다른 스케줄에 연결되어 있는지 확인
                Optional<Schedule> otherSchedule = scheduleRepository.findByCoverLetter(coverLetter);
                if (otherSchedule.isPresent() && !otherSchedule.get().getScheduleId().equals(scheduleId)) {
                    throw new BaseException(ErrorCode.COVER_LETTER_ALREADY_IN_USE); // 커스텀 에러 코드 정의 필요
                }
                schedule.setScheduleCoverLetter(coverLetter);
            }
        }

        schedule.setScheduleStartDate(requestDto.getScheduleStartDate());
        schedule.setScheduleEndDate(requestDto.getScheduleEndDate());
        schedule.setScheduleTitle(requestDto.getScheduleTitle());
        schedule.setScheduleMemo(requestDto.getScheduleMemo());

        return new ScheduleIdResponseDto(schedule.getScheduleId());
    }

    public List<ScheduleListResponseDto> allSchedule(Integer userId){

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        List<Schedule> schedules = scheduleRepository.findByUser(user);

        List<ScheduleListResponseDto> responseDto = new ArrayList<>();

        for(Schedule schedule: schedules){
            responseDto.add(ScheduleListResponseDto.builder()
                            .scheduleId(schedule.getScheduleId())
                            .scheduleStartDate(schedule.getScheduleStartDate())
                            .scheduleEndDate(schedule.getScheduleEndDate())
                            .scheduleTitle(schedule.getScheduleTitle())
                            .scheduleStatusName(schedule.getScheduleStatus().getScheduleStatusName())
                            .scheduleStatusStep(schedule.getScheduleStatus().getScheduleStatusStep().name())
                    .build());
        }

        return responseDto;
    }


}
