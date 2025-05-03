package com.ssafy.hellojob.domain.schedule.service;

import com.ssafy.hellojob.domain.coverletter.entity.CoverLetter;
import com.ssafy.hellojob.domain.coverletter.repository.CoverLetterRepository;
import com.ssafy.hellojob.domain.schedule.dto.request.ScheduleAddRequestDto;
import com.ssafy.hellojob.domain.schedule.dto.response.ScheduleIdResponseDto;
import com.ssafy.hellojob.domain.schedule.entity.Schedule;
import com.ssafy.hellojob.domain.schedule.entity.ScheduleStatus;
import com.ssafy.hellojob.domain.schedule.repository.ScheduleRepository;
import com.ssafy.hellojob.domain.schedule.repository.ScheduleStatusRepository;
import com.ssafy.hellojob.domain.user.entity.User;
import com.ssafy.hellojob.domain.user.repository.UserRepository;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

}
