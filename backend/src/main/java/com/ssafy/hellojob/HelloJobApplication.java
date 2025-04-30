package com.ssafy.hellojob;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class HelloJobApplication {

	public static void main(String[] args) {
		SpringApplication.run(HelloJobApplication.class, args);
	}

}

