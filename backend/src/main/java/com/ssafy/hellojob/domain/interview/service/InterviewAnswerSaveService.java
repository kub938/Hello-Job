package com.ssafy.hellojob.domain.interview.service;

import com.ssafy.hellojob.domain.interview.entity.CoverLetterInterview;
import com.ssafy.hellojob.domain.interview.entity.Interview;
import com.ssafy.hellojob.domain.interview.entity.InterviewAnswer;
import com.ssafy.hellojob.domain.interview.entity.InterviewVideo;
import com.ssafy.hellojob.domain.interview.repository.InterviewAnswerRepository;
import com.ssafy.hellojob.domain.user.service.UserReadService;
import com.ssafy.hellojob.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import static com.ssafy.hellojob.global.exception.ErrorCode.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewAnswerSaveService {

    private final InterviewAnswerRepository interviewAnswerRepository;
    private final UserReadService userReadService;
    private final InterviewReadService interviewReadService;
    private final InterviewAnswerContentSaveService interviewAnswerContentSaveService;

    @Value("${FFPROBE_PATH}")
    private String ffprobePath;

    @Value("${FFMPEG_PATH}")
    private String ffmpegPath;

    // 동영상 저장
    @Transactional
    public Map<String, String> saveVideo(Integer userId, String url, Integer interviewAnswerId, File tempVideoFile){
        userReadService.findUserByIdOrElseThrow(userId);
        InterviewAnswer interviewAnswer = interviewReadService.findInterviewAnswerByIdOrElseThrow(interviewAnswerId);

        String videoLength = "";
        try {
            videoLength = getVideoDurationWithFFprobe(tempVideoFile);
        } catch (Exception e){
            log.debug("영상 길이 추출 실패 - Exception: {}", e);
            throw new BaseException(GET_VIDEO_LENGTH_FAIL);
        }

        try{
            interviewAnswerContentSaveService.saveUrl(url, interviewAnswer);
        } catch(Exception e){
            log.debug("😱 삐상 !!! 영상 url 저장 중 에러 발생 !!!: {}", e);
        }

        try{
            interviewAnswerContentSaveService.saveTime(videoLength, interviewAnswer);
        } catch(Exception e){
            log.debug("😱 삐상 !!! 영상 시간 저장 중 에러 발생 !!!: {}", e);
        }

        if(interviewAnswer.getInterviewAnswer() == null || interviewAnswer.getInterviewAnswer().equals("")){
            try{
                log.debug("😱 id: {} url 저장할 때까지 답변 저장이 안됨 이슈 발발,,, 강제로 저장해버려,,,", interviewAnswer.getInterviewAnswerId());
                interviewAnswerContentSaveService.saveAnswer("stt 변환에 실패했습니다", interviewAnswer);
            } catch(Exception e){
                log.debug("😱 id: {} url 저장하는 함수에서 답변 강제 저장하는데 여기서도 에러 터짐 !!!!!!!", interviewAnswer.getInterviewAnswerId());
            }
        }

        interviewAnswerRepository.flush();

        return Map.of("message", "정상적으로 저장되었습니다.");
    }

    // 한 문항 종료(면접 답변 저장)
    @Transactional
    public Map<String, String> saveInterviewAnswer(Integer userId, String answer, Integer interviewAnswerId) {

        log.debug("😎 면접 답변 저장 함수 들어옴 : {}", interviewAnswerId);

        userReadService.findUserByIdOrElseThrow(userId);

        InterviewAnswer interviewAnswer = interviewReadService.findInterviewAnswerByIdOrElseThrow(interviewAnswerId);
        InterviewVideo interviewVideo = interviewReadService.findInterviewVideoByIdOrElseThrow(interviewAnswer.getInterviewVideo().getInterviewVideoId());

        log.debug("interviewAnswerId: {}", interviewAnswer.getInterviewAnswerId());
        log.debug("interviewVideoId: {}", interviewVideo.getInterviewVideoId());

        validateUserOwnership(userId, interviewAnswer, interviewVideo);

        if(answer == null || answer.equals("")){
            answer = "stt 변환에 실패했습니다";
        }

        try{
            interviewAnswerContentSaveService.saveAnswer(answer, interviewAnswer);
        } catch(Exception e){
            log.debug("😱 id:{} 삐상 !!! 답변 저장 중 에러 발생 !!!: {}", interviewAnswerId, e);
        }

        interviewAnswerRepository.flush();

        return Map.of("message", "정상적으로 저장되었습니다.");
    }

    private void validateUserOwnership(Integer userId, InterviewAnswer interviewAnswer, InterviewVideo interviewVideo) {
        if (interviewAnswer.getInterviewQuestionCategory().name().equals("자기소개서면접")) {
            CoverLetterInterview coverLetterInterview = interviewReadService.findCoverLetterInterviewById(
                    interviewVideo.getCoverLetterInterview().getCoverLetterInterviewId());
            if (!userId.equals(coverLetterInterview.getUser().getUserId())) {
                throw new BaseException(INVALID_USER);
            }
        } else {
            Interview interview = interviewReadService.findInterviewById(interviewVideo.getInterview().getInterviewId());
            if (!userId.equals(interview.getUser().getUserId())) {
                throw new BaseException(INVALID_USER);
            }
        }
    }

    // 동영상에서 시간 뽑아내기
    // 영상 길이 추출 + .webm -> .mp4 자동 변환
    public String getVideoDurationWithFFprobe(File videoFile) {
        log.debug("😎 동영상 시간 추출 함수 들어옴");

        long start = System.nanoTime();

        try {
            // 확장자 추출
            String originalFilename = videoFile.getName();
            String extension = originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".webm";

            // 임시 파일 생성 및 복사
            File webmTempFile = File.createTempFile("upload", extension);
            Files.copy(videoFile.toPath(), webmTempFile.toPath(), StandardCopyOption.REPLACE_EXISTING);

            File mp4TempFile = File.createTempFile("converted", ".mp4");

            // ffmpeg 실행 (webm → mp4)
            ProcessBuilder ffmpegPb = new ProcessBuilder(
                    ffmpegPath, "-y",
                    "-i", webmTempFile.getAbsolutePath(),
                    "-c:v", "libx264",
                    "-preset", "ultrafast",
                    "-c:a", "aac",
                    "-strict", "experimental",
                    mp4TempFile.getAbsolutePath()
            );
            ffmpegPb.redirectErrorStream(true);
            Process ffmpegProcess = ffmpegPb.start();

            new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(ffmpegProcess.getInputStream()))) {
                    while (reader.readLine() != null) ;
                } catch (IOException e) {
                    log.warn("⚠️ ffmpeg 로그 읽기 실패", e);
                }
            }).start();

            boolean ffmpegFinished = ffmpegProcess.waitFor(30, TimeUnit.SECONDS);
            if (!ffmpegFinished) {
                ffmpegProcess.destroyForcibly();
                log.error("❌ ffmpeg 시간 초과로 강제 종료됨");
                return "";
            }

            // ffprobe 실행
            ProcessBuilder ffprobePb = new ProcessBuilder(
                    ffprobePath,
                    "-v", "error",
                    "-show_entries", "format=duration",
                    "-of", "default=noprint_wrappers=1:nokey=1",
                    mp4TempFile.getAbsolutePath()
            );
            Process ffprobeProcess = ffprobePb.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(ffprobeProcess.getInputStream()));
            String durationStr = reader.readLine();
            ffprobeProcess.waitFor();



            // 파일 삭제
            try {
                Files.deleteIfExists(webmTempFile.toPath());
                Files.deleteIfExists(mp4TempFile.toPath());
            } catch (IOException e) {
                log.warn("⚠️ 임시 파일 삭제 실패", e);
            }

            if (durationStr == null || durationStr.trim().isEmpty() || durationStr.trim().equalsIgnoreCase("N/A")) {
                log.warn("⚠️ ffprobe 결과로부터 duration 추출 실패: '{}'", durationStr);
                return "";
            }

            double durationInSeconds;
            try {
                durationInSeconds = Double.parseDouble(durationStr.trim());
            } catch (NumberFormatException e) {
                log.error("❌ duration 값이 유효하지 않음: '{}'", durationStr);
                return "";
            }

            int hours = (int) durationInSeconds / 3600;
            int minutes = ((int) durationInSeconds % 3600) / 60;
            int seconds = (int) durationInSeconds % 60;

            String result = String.format("%02d:%02d:%02d", hours, minutes, seconds);
            long end = System.nanoTime();
            log.info("🎥 영상 길이: {} (처리 시간: {} ms)", result, (end - start) / 1_000_000);
            return result;

        } catch (Exception e) {
            log.error("❌ 영상 길이 추출 중 예외 발생: {}", e.getMessage(), e);
            return "";
        }
    }


}
