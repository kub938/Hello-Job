package com.ssafy.hellojob.domain.schedule.controller;

import com.ssafy.hellojob.domain.schedule.dto.request.ScheduleAddRequestDto;
import com.ssafy.hellojob.domain.schedule.dto.request.ScheduleUpdateScheduleCoverLetterRequestDto;
import com.ssafy.hellojob.domain.schedule.dto.request.ScheduleUpdateScheduleStatusRequestDto;
import com.ssafy.hellojob.domain.schedule.dto.response.ScheduleDetailCompanyAnalysis;
import com.ssafy.hellojob.domain.schedule.dto.response.ScheduleDetailResponseDto;
import com.ssafy.hellojob.domain.schedule.dto.response.ScheduleIdResponseDto;
import com.ssafy.hellojob.domain.schedule.dto.response.ScheduleListResponseDto;
import com.ssafy.hellojob.domain.schedule.service.ScheduleService;
import com.ssafy.hellojob.global.auth.token.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/schedule")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping()
    public ScheduleIdResponseDto ScheduleAdd(@Valid @RequestBody ScheduleAddRequestDto requestDto,
                                              @AuthenticationPrincipal UserPrincipal userPrincipal){

        Integer userId = userPrincipal.getUserId();

        ScheduleIdResponseDto responseDto = scheduleService.addSchedule(requestDto, userId);

        return responseDto;

    }

    @DeleteMapping("{scheduleId}")
    public void ScheduleDelete(@PathVariable("scheduleId") Long scheduleId,
                               @AuthenticationPrincipal UserPrincipal userPrincipal){
        Integer userId = userPrincipal.getUserId();

        scheduleService.deleteSchedule(scheduleId, userId);

    }

    @PatchMapping("/{scheduleId}/status")
    public ScheduleIdResponseDto ScheduleUpdateStatus(@RequestBody ScheduleUpdateScheduleStatusRequestDto requestDto,
                                                      @PathVariable("scheduleId") Long scheduleId,
                                                      @AuthenticationPrincipal UserPrincipal userPrincipal){
        Integer userId = userPrincipal.getUserId();

        ScheduleIdResponseDto responseDto = scheduleService.updateScheduleStatus(requestDto, scheduleId, userId);
        return responseDto;
    }

    @PatchMapping("/{scheduleId}/cover-letter")
    public ScheduleIdResponseDto ScheduleUpdateCoverLetter(@RequestBody ScheduleUpdateScheduleCoverLetterRequestDto requestDto,
                                                            @PathVariable("scheduleId") Long scheduleId,
                                                            @AuthenticationPrincipal UserPrincipal userPrincipal){
        Integer userId = userPrincipal.getUserId();

        ScheduleIdResponseDto responseDto = scheduleService.updateScheduleCoverLetter(requestDto, scheduleId, userId);
        return responseDto;
    }

    @PutMapping("/{scheduleId}")
    public ScheduleIdResponseDto ScheduleUpdate(@RequestBody ScheduleAddRequestDto requestDto,
                                                @PathVariable("scheduleId") Long scheduleId,
                                                @AuthenticationPrincipal UserPrincipal userPrincipal){
        Integer userId = userPrincipal.getUserId();
        ScheduleIdResponseDto responseDto = scheduleService.updateSchedule(requestDto, scheduleId, userId);
        return responseDto;
    }

    @GetMapping()
    public ResponseEntity<?> ScheduleList(@AuthenticationPrincipal UserPrincipal userPrincipal){
        Integer userId = userPrincipal.getUserId();
        List<ScheduleListResponseDto> responseDto = scheduleService.allSchedule(userId);

        if(responseDto.size() != 0 || !responseDto.isEmpty()){
            return ResponseEntity.ok(responseDto);
        }

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{scheduleId}")
    public ScheduleDetailResponseDto ScheduleDetail(@PathVariable("scheduleId") Long scheduleId,
                                                    @AuthenticationPrincipal UserPrincipal userPrincipal){
        Integer userId = userPrincipal.getUserId();
        ScheduleDetailResponseDto responseDto = scheduleService.detailSchedule(scheduleId, userId);

        return responseDto;
    }


}
