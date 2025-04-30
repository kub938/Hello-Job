package com.ssafy.hellojob.global.config.webclient;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${FASTAPI_URL}")
    private String fastApiUrl;

    @Bean
    public WebClient fastApiWebClient() {
        return WebClient.builder()
                .baseUrl(fastApiUrl) // FastAPI 서버 URL
                .build();
    }
}
