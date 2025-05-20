package com.ssafy.hellojob.global.config.stt;

import com.ssafy.hellojob.domain.interview.dto.request.SttRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

@Configuration
public class SttQueueConfig {

    @Bean
    public BlockingQueue<SttRequest> sttRequestQueue() {
        return new LinkedBlockingQueue<>();
    }
}
