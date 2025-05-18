import Interviewer from "../../../assets/interview/Interviewer.webp";
import VideoDisplay from "../components/VideoDisplay";
import { useCameraDeviceStore, useAudioDeviceStore } from "@/store/deviceStore";
import { useState, useRef } from "react";
import { useCameraStream } from "../hooks/cameraStream";
import { useAudioStream } from "../hooks/useAudioStream";
import { Button } from "@/components/Button";
import { toast } from "sonner";
import { useCompleteQuestion } from "@/hooks/interviewHooks";
import { useLocation } from "react-router";
import { StartInterviewResponse } from "@/types/interviewApiTypes";
import Timer from "../components/Timer";
import InterviewPreparationModal from "../components/InterviewPreparationModal";
import InterviewCompleteModal from "../components/InterviewCompleteModal";
import { useInterviewStore } from "@/store/interviewStore";

function PracticeInterviewPage() {
  const [isAnswerStarted, setIsAnswerStarted] = useState(false);
  const [_, setRecordedBlob] = useState<Blob | null>(null);
  const [nowQuestionNumber, setNowQuestionNumber] = useState(0);
  const [isOpenCompleteModal, setIsOpenCompleteModal] = useState(false);
  const { selectInterviewType } = useInterviewStore();
  const location = useLocation();
  //interview Data
  const interviewData: StartInterviewResponse = location.state;
  const questions = interviewData.questionList;

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
  const { cameraStream, videoRef } = useCameraStream({
    selectedDevice: selectedVideo,
    onError: (message) => toast.error(message),
  });

  // useAudioStream 훅 사용
  const {
    audioStream,
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

      if (nowQuestionNumber + 1 === questions.length) {
        //전체완료 훅 구현 후 연동

        setIsOpenCompleteModal(true);

        return;
      }

      setIsAnswerStarted(false);
      console.log("답변 녹음 및 녹화가 완료되었습니다.");
      setNowQuestionNumber((prev) => prev + 1);
    } catch (err) {
      console.error("답변 완료 중 오류 발생:", err);
      toast.error("답변 완료 중 오류가 발생했습니다.");
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
    <>
      {isOpenCompleteModal && (
        <InterviewCompleteModal
          interviewVideoId={interviewData.interviewVideoId}
        />
      )}
      {!isAnswerStarted && !isOpenCompleteModal && (
        <InterviewPreparationModal
          onStart={handleAnswerStarted}
          questions={questions}
          nowQuestionNumber={nowQuestionNumber}
          type={selectInterviewType}
        />
      )}
      <div className="relative h-full w-full">
        {/* 문항 및 버튼 헤더 */}
        <div className="border border-l-4 mb-1 border-l-primary rounded w-full md:h-20 flex flex-col md:flex-row px-3 md:px-7 md:py-0 justify-between items-start md:items-center">
          <div className="mb-2 md:mb-0">
            <div className="text-sm">
              문항 {nowQuestionNumber + 1} / {questions.length}
            </div>
            <div className="text-xl font-bold">
              질문 : {questions[nowQuestionNumber].question}
            </div>
          </div>
          <Button onClick={handleAnswerCompleted} className="w-50 h-15 text-lg">
            답변 완료
          </Button>
        </div>

        {/* 면접 화면 영역 - 상대적 컨테이너 */}
        <div className="relative flex h-[70vh] md:h-[80vh] lg:h-[85vh] w-full bg-gray-100 overflow-hidden">
          {/* 메인 면접관 이미지 - 이미지를 컨테이너 크기에 맞게 조절 */}
          <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center">
            <img
              src={Interviewer}
              className="max-w-full max-h-full object-cover h-full w-full rounded"
              alt="면접관"
            />
          </div>

          {/* 오른쪽 컨트롤 영역 - 데스크톱에서는 오른쪽에, 바일에서는 하단에 배치 */}
          <div className="absolute lg:top-0 lg:right-0 lg:w-[30%] lg:h-full bottom-0 lg:bottom-auto w-full lg:bg-opacity-20  rounded-t-lg lg:rounded-none p-4 flex flex-col  lg:items-end justify-between z-10">
            <div className="flex size-60  mb-4">
              <Timer
                isComplete={questions.length + 1 === nowQuestionNumber}
                time={120}
                prepareState={isAnswerStarted}
                onAnswerCompleted={handleAnswerCompleted}
              />
            </div>

            {/* 비디오 디스플레이 - 반응형으로 조정 */}
            <div className="w-70 h-60">
              <VideoDisplay
                cameraStream={cameraStream}
                videoRef={videoRef}
                onVideoLoadedData={handleVideoLoadedData}
              />
            </div>

            {/* 오디오 레벨 인디케이터 */}
            {/* {audioStream && (
            <div className="mt-2 lg:mt-4 w-[90%] lg:w-[80%] flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-lg mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-gray-500"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-100"
                  style={{ width: `${Math.min(audioLevel, 100)}%` }}
                />
              </div>
            </div>
          )} */}

            {/* 녹화 표시기 */}
            {/* {isAnswerStarted && isRecording && (
            <div className="mt-2 lg:mt-4 text-red-500 flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm">녹화 중...</span>
            </div>
          )} */}
          </div>
        </div>
      </div>
    </>
  );
}

export default PracticeInterviewPage;
