package com.ssafy.hellojob.domain.interview.service;

import com.ssafy.hellojob.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.*;

import static com.ssafy.hellojob.global.exception.ErrorCode.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3UploadService {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    @Value("${cloud.aws.credentials.access-key}")
    private String accessKey;

    @Value("${cloud.aws.credentials.secret-key}")
    private String secretKey;

    @Value("${cloud.aws.region.static}")
    private String region;

    // S3에 영상 업로드
    public String uploadVideo(MultipartFile file) {

        if(file.getSize() > 500 * 1024 * 1024){
            throw new BaseException(VIDEO_TOO_LARGE);
        }

        log.debug("😎 면접 S3 upload 함수 들어옴 : {}", file.getOriginalFilename());

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

                log.debug("😎 S3 업로드 성공");
                
                // 업로드 성공 시 URL 반환
                return s3Client.utilities()
                        .getUrl(GetUrlRequest.builder().bucket(bucketName).key(key).build())
                        .toString();

            } catch (IOException e) {
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

    // S3UploadService에 새로운 메서드 추가
    public void deleteVideos(List<String> s3Urls) {
        if (s3Urls.isEmpty()) {
            return;
        }

        // URL에서 키 추출 후 그룹핑
        Map<String, List<ObjectIdentifier>> bucketToKeys = new HashMap<>();

        for (String s3Url : s3Urls) {
            try {
                String key = extractKeyFromUrl(s3Url);
                if (key != null) {
                    bucketToKeys.computeIfAbsent(bucketName, k -> new ArrayList<>())
                            .add(ObjectIdentifier.builder().key(key).build());
                }
            } catch(Exception e) {
                log.warn("⚠️ URL 파싱 실패, 개별 삭제로 대체: {}", s3Url);
                deleteVideo(s3Url); // 개별 삭제로 대체
            }
        }

        // 배치 삭제 수행
        for (Map.Entry<String, List<ObjectIdentifier>> entry : bucketToKeys.entrySet()) {
            List<ObjectIdentifier> keys = entry.getValue();

            // S3 배치 삭제는 최대 1000개씩 처리
            for (int i = 0; i < keys.size(); i += 1000) {
                List<ObjectIdentifier> batch = keys.subList(i,
                        Math.min(i + 1000, keys.size()));

                Delete deleteRequest = Delete.builder()
                        .objects(batch)
                        .build();

                DeleteObjectsRequest request = DeleteObjectsRequest.builder()
                        .bucket(entry.getKey())
                        .delete(deleteRequest)
                        .build();

                try {
                    DeleteObjectsResponse response = s3Client.deleteObjects(request);

                    // 삭제 실패한 객체 확인
                    if (!response.errors().isEmpty()) {
                        response.errors().forEach(error ->
                                log.error("❌ S3 배치 삭제 실패 - Key: {}, Error: {}",
                                        error.key(), error.message()));
                        throw new BaseException(S3_DELETE_FAILED);
                    }

                    log.info("✅ S3 배치 삭제 성공 - {} 개 파일", batch.size());
                } catch (Exception e) {
                    log.error("❌ S3 배치 삭제 API 호출 실패: {}", e.getMessage());
                    throw new BaseException(S3_DELETE_FAILED);
                }
            }
        }
    }

    // S3 URL을 받아서 해당 영상을 삭제
    public void deleteVideo(String s3Url) {
        if (s3Url == null || s3Url.isEmpty()) {
            log.warn("⚠️ 삭제할 S3 URL이 제공되지 않았습니다");
            throw new BaseException(S3_URL_INVALID);
        }

        try {
            // S3 URL에서 key 추출
            String key = extractKeyFromUrl(s3Url);
            if (key == null || key.isEmpty()) {
                log.warn("⚠️ S3 URL에서 key를 추출할 수 없습니다: {}", s3Url);
                throw new BaseException(S3_KEY_EXTRACTION_FAILED);
            }

            // 파일 삭제 요청 생성
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            int maxRetries = 5;
            int attempt = 0;
            Exception lastException = null;

            while (attempt < maxRetries) {
                try {
                    s3Client.deleteObject(deleteObjectRequest);
                    log.info("✅ S3 파일 삭제 성공: {}", key);
                    return; // 성공적으로 삭제됨

                } catch (Exception e) {
                    lastException = e;
                    attempt++;

                    if (attempt >= maxRetries) {
                        log.error("❌ S3 파일 삭제 실패 - 최대 재시도 횟수 초과: {}", e.getMessage());
                        break;
                    }

                    log.warn("⚠️ S3 파일 삭제 실패 - 재시도 중 ({}/{}): {}", attempt, maxRetries, e.getMessage());

                    // 재시도 간 딜레이 (선택 사항)
                    try {
                        Thread.sleep(1000 * (long)attempt); // 1초, 2초, 3초... 점진적 딜레이
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        log.warn("⚠️ 대기 중 인터럽트 발생");
                        throw new BaseException(S3_DELETE_FAILED);
                    }
                }
            }

            // 최대 재시도 횟수 초과 시 예외 발생
            log.error("❌ S3 파일 삭제 최종 실패 - URL: {}, 마지막 오류: {}", s3Url,
                    lastException != null ? lastException.getMessage() : "Unknown error");
            throw new BaseException(S3_DELETE_FAILED);

        } catch (BaseException e) {
            // BaseException은 그대로 다시 던짐
            throw e;
        } catch (Exception e) {
            log.error("❌ S3 URL 처리 중 예상치 못한 예외 발생: {}", e.getMessage());
            throw new BaseException(S3_DELETE_FAILED);
        }
    }

    // S3 URL에서 key 부분 추출하는 유틸리티 메서드
    private String extractKeyFromUrl(String s3Url) {
        try {
            // 예상 URL 형태: https://bucket-name.s3.region.amazonaws.com/videos/uuid_filename.ext
            // 또는: https://s3.region.amazonaws.com/bucket-name/videos/uuid_filename.ext

            if (s3Url.contains(".s3.")) {
                // Virtual-hosted-style URL 처리
                String afterProtocol = s3Url.substring(s3Url.indexOf("://") + 3);
                int firstSlash = afterProtocol.indexOf("/");
                if (firstSlash > 0) {
                    return afterProtocol.substring(firstSlash + 1);
                }
            } else if (s3Url.contains("s3.") && s3Url.contains("/" + bucketName + "/")) {
                // Path-style URL 처리
                String pattern = "/" + bucketName + "/";
                int bucketIndex = s3Url.indexOf(pattern);
                if (bucketIndex > 0) {
                    return s3Url.substring(bucketIndex + pattern.length());
                }
            }

            return null;
        } catch (Exception e) {
            log.error("❌ URL 파싱 중 오류 발생: {}", e.getMessage());
            return null;
        }
    }

}