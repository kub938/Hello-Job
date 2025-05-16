import { Volume2 } from "lucide-react";
import Interviewer from "../../../assets/interview/Interviewer.webp";
import VideoDisplay from "../components/VideoDisplay";
import { useCameraDeviceStore, useAudioDeviceStore } from "@/store/deviceStore";
import { useState, useRef } from "react";
import { useCameraStream } from "../hooks/cameraStream";
import { useAudioStream } from "../hooks/useAudioStream";
import { Button } from "@/components/Button";
import { toast } from "sonner";
import { useCompleteQuestion } from "@/hooks/interviewHooks";

function PracticeInterviewPage() {
  const [isAnswerStarted, setIsAnswerStarted] = useState<boolean>(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  // API 제출 상태 추가
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 비디오 녹화 관련 상태 및 참조 추가
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // API 제출을 위한 mutation 가져오기
  const completeQuestionMutation = useCompleteQuestion();

  // 카메라 스토어에서 선택된 비디오 장치 가져오기
  const {
    selectedVideo, //선택된 카메라 장치 ID
  } = useCameraDeviceStore();

  // 오디오 스토어에서 선택된 오디오 장치 가져오기
  const {
    selectedAudio, //선택된 오디오 장치 ID
  } = useAudioDeviceStore();

  // useCameraStream 훅 사용
  const { cameraStream, videoRef, isVideoReady } = useCameraStream({
    selectedDevice: selectedVideo,
    onError: (message) => toast.error(message),
  });

  // useAudioStream 훅 사용
  const {
    audioStream,
    audioLevel,
    startStream: startAudioStream,
    isRecording: isAudioRecording,
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording,
  } = useAudioStream({
    selectedDevice: selectedAudio,
    onError: (message) => toast.error(message),
    noiseThreshold: 15, // 소음 임계값 설정
  });

  // 비디오 요소가 데이터를 로드했을 때 호출되는 이벤트 핸들러
  const handleVideoLoadedData = () => {
    console.log("비디오 데이터 로드됨");
  };

  // 비디오 녹화 시작 함수
  const startVideoRecording = async () => {
    if (!cameraStream || !audioStream) {
      toast.error(
        "카메라 또는 마이크가 연결되지 않아 녹화를 시작할 수 없습니다."
      );
      return;
    }

    try {
      // 비디오와 오디오 스트림을 결합
      const combinedTracks = [
        ...cameraStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ];
      const combinedStream = new MediaStream(combinedTracks);

      // MediaRecorder 설정
      const options = { mimeType: "video/webm;codecs=vp9,opus" };
      const recorder = new MediaRecorder(combinedStream, options);
      mediaRecorderRef.current = recorder;

      // 녹화 데이터 수집
      recordedChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      // 녹화 시작
      recorder.start();
      setIsRecording(true);
      console.log("비디오 녹화가 시작되었습니다.");
    } catch (err) {
      console.error("비디오 녹화 시작 중 오류 발생:", err);
      toast.error("비디오 녹화를 시작할 수 없습니다.");
    }
  };

  // 비디오 녹화 중지 함수
  const stopVideoRecording = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || !isRecording) {
        reject(new Error("녹화가 진행 중이지 않습니다."));
        return;
      }

      // 녹화 종료 이벤트 핸들러
      mediaRecorderRef.current.onstop = () => {
        console.log("비디오 녹화가 중지되었습니다.");
        setIsRecording(false);

        // 녹화 데이터를 Blob으로 합치기
        const videoBlob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        resolve(videoBlob);
      };

      // 녹화 중지
      mediaRecorderRef.current.stop();
    });
  };

  // 답변 시작 버튼 클릭 핸들러
  const handleAnswerStarted = async () => {
    if (!cameraStream || !audioStream) {
      toast.error(
        "카메라 또는 마이크가 연결되지 않아 녹화를 시작할 수 없습니다."
      );
      return;
    }
    if (isAnswerStarted) {
      return; // 이미 답변 중이면 무시
    }

    try {
      // 오디오 스트림이 없으면 시작
      if (!audioStream) {
        await startAudioStream();
      }

      // 오디오 녹음 시작
      startAudioRecording();

      // 비디오 녹화 시작
      await startVideoRecording();

      setIsAnswerStarted(true);
      console.log("답변 녹음 및 녹화가 시작되었습니다.");
    } catch (err) {
      console.error("답변 시작 중 오류 발생:", err);
      toast.error("답변 시작 중 오류가 발생했습니다.");
    }
  };

  // 답변 완료 버튼 클릭 핸들러
  const handleAnswerCompleted = async () => {
    if (!isAnswerStarted) {
      return; // 답변 중이 아니면 무시
    }

    try {
      setIsSubmitting(true);
      let audioBlob: Blob | null = null;
      let videoBlob: Blob | null = null;

      // 오디오 녹음 중지
      if (isAudioRecording) {
        audioBlob = await stopAudioRecording();
        setRecordedBlob(audioBlob);
      }

      // 비디오 녹화 중지
      if (isRecording) {
        videoBlob = await stopVideoRecording();
      }

      // 녹화된 파일 API 전송
      if (audioBlob && videoBlob) {
        await submitRecordingsToAPI(videoBlob, audioBlob);
      } else {
        toast.error("녹음 또는 녹화 파일이 생성되지 않았습니다.");
      }

      setIsAnswerStarted(false);
      setIsSubmitting(false);
      console.log("답변 녹음 및 녹화가 완료되었습니다.");
    } catch (err) {
      console.error("답변 완료 중 오류 발생:", err);
      toast.error("답변 완료 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  };

  // API로 녹화 파일 제출 함수
  const submitRecordingsToAPI = async (videoBlob: Blob, audioBlob: Blob) => {
    try {
      // Blob을 File 객체로 변환
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      const videoFile = new File(
        [videoBlob],
        `interview_video_${timestamp}.webm`,
        { type: videoBlob.type }
      );

      const audioFile = new File(
        [audioBlob],
        `interview_audio_${timestamp}.webm`,
        { type: audioBlob.type }
      );

      completeQuestionMutation.mutate({
        interviewAnswerId: 1, // 실제 인터뷰 정보 ID로 변경 필요
        videoFile,
        audioFile,
      });
    } catch (error) {
      console.error("API 제출 중 오류 발생:", error);

      throw error; // 상위 함수에서 처리할 수 있도록 에러 전파
    }
  };

  return (
    <div className="relative h-full w-full">
      {/* 면접 화면 영역 */}
      <div className="flex gap-2 h-full w-full">
        {/* 메인 면접관 이미지 */}
        <img src={Interviewer} className="h-[65vh]" alt="면접관" />
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          <VideoDisplay
            cameraStream={cameraStream}
            videoRef={videoRef}
            onVideoLoadedData={handleVideoLoadedData}
            height={260}
          />
          {audioStream && (
            <div className="mt-4 w-[80%] flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-lg">
              <Volume2 className="h-4 w-4 text-gray-500" />
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-100"
                  style={{ width: `${Math.min(audioLevel, 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {!isAnswerStarted ? (
              <Button
                onClick={handleAnswerStarted}
                className={isAnswerStarted ? "bg-gray-400" : ""}
                disabled={isAnswerStarted}
              >
                답변 시작
              </Button>
            ) : (
              <Button
                onClick={handleAnswerCompleted}
                className="bg-red-500 hover:bg-red-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "제출 중..." : "답변 완료"}
              </Button>
            )}
          </div>

          {isAnswerStarted && isRecording && (
            <div className="mt-4 text-red-500 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm">녹화 중...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PracticeInterviewPage;
