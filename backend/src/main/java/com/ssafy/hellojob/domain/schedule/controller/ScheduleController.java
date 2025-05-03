package com.ssafy.hellojob.domain.schedule.controller;

import com.ssafy.hellojob.domain.schedule.dto.request.ScheduleAddRequestDto;
import com.ssafy.hellojob.domain.schedule.dto.response.ScheduleIdResponseDto;
import com.ssafy.hellojob.domain.schedule.service.ScheduleService;
import com.ssafy.hellojob.global.auth.token.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/schedule")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping()
    private ScheduleIdResponseDto ScheduleAdd(@Valid @RequestBody ScheduleAddRequestDto requestDto,
                                              @AuthenticationPrincipal UserPrincipal userPrincipal){

        Integer userId = userPrincipal.getUserId();

        ScheduleIdResponseDto responseDto = scheduleService.addSchedule(requestDto, userId);

        return responseDto;

    }

}
