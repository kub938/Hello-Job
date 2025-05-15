package com.ssafy.hellojob.domain.interview.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3UploadService {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    public String uploadVideo(MultipartFile file) throws IOException {
        String originalFileName = file.getOriginalFilename();
        String key = "videos/" + UUID.randomUUID() + "_" + originalFileName;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build();

        int maxRetries = 5;
        int attempt = 0;

        while (attempt < maxRetries) {
            try {
                s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

                // 업로드 성공 시 URL 반환
                return s3Client.utilities()
                        .getUrl(GetUrlRequest.builder().bucket(bucketName).key(key).build())
                        .toString();

            } catch (Exception e) {
                attempt++;
                if (attempt >= maxRetries) {
                    // 로그를 남기거나 알림을 추가할 수도 있음
                    log.debug("❌ S3 업로드 실패 - 최대 재시도 횟수 초과: {}", e.getMessage());
                    break;
                }

                // 로그 및 재시도 딜레이 추가 (선택 사항)
                log.debug("⚠️ S3 업로드 실패 - 재시도 중 ({}/{}): {}", attempt, maxRetries, e.getMessage());
            }
        }

        // 실패 시 빈 문자열 반환
        return "";
    }

}