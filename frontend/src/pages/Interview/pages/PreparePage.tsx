import { useState, useEffect, useRef } from "react";
import { Camera, Mic, MicOff } from "lucide-react";

// MediaDevice 관련 타입 정의
interface MediaDeviceInfo {
  deviceId: string;
  groupId: string;
  kind: string;
  label: string;
}

function PreparePage() {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string>("");
  const [selectedAudio, setSelectedAudio] = useState<string>("");
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [_, setIsVideoReady] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 장치 목록 가져오기
  useEffect(() => {
    async function getDevices(): Promise<void> {
      try {
        console.log("미디어 장치 권한 요청 중...");
        // 사용자에게 권한 요청을 위해 미디어에 먼저 접근
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        console.log("미디어 권한 획득 성공");

        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log("모든 미디어 장치:", devices);

        const videos = devices.filter(
          (device) => device.kind === "videoinput"
        ) as MediaDeviceInfo[];
        const audios = devices.filter(
          (device) => device.kind === "audioinput"
        ) as MediaDeviceInfo[];

        console.log("발견된 비디오 장치:", videos);
        console.log("발견된 오디오 장치:", audios);

        setVideoDevices(videos);
        setAudioDevices(audios);

        if (videos.length > 0) setSelectedVideo(videos[0].deviceId);
        if (audios.length > 0) setSelectedAudio(audios[0].deviceId);
      } catch (err) {
        console.error("장치 목록을 가져오는 중 오류 발생:", err);
        setError("카메라 또는 마이크 접근 권한이 필요합니다.");
      }
    }

    getDevices();

    // 컴포넌트 언마운트 시 모든 스트림 정리
    return () => {
      stopMediaStreams();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // 선택된 비디오 장치가 변경될 때 스트림 업데이트
  useEffect(() => {
    if (selectedVideo) {
      console.log("선택된 비디오 장치 변경됨:", selectedVideo);
      startVideoStream();
    }
  }, [selectedVideo]);

  // 선택된 오디오 장치가 변경될 때 스트림 업데이트
  useEffect(() => {
    if (selectedAudio) {
      console.log("선택된 오디오 장치 변경됨:", selectedAudio);
      startAudioStream();
    }
  }, [selectedAudio]);

  // 비디오 요소 로드 이벤트 처리
  const handleVideoLoadedData = () => {
    console.log("비디오 데이터 로드됨");
    setIsVideoReady(true);
  };

  // 비디오 스트림 시작
  const startVideoStream = async (): Promise<void> => {
    try {
      // 기존 비디오 스트림 중지
      if (cameraStream) {
        console.log("기존 카메라 스트림 중지 중...");
        cameraStream.getTracks().forEach((track) => track.stop());
      }

      console.log("카메라 연결 시도 중...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedVideo ? { exact: selectedVideo } : undefined,
        },
      });
      console.log("카메라 스트림 획득 성공:", stream);

      setCameraStream(stream);
      setIsVideoReady(false); // 새 스트림이 로드될 때까지 대기

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("비디오 요소에 스트림 연결됨");
      } else {
        console.error("비디오 요소 참조를 찾을 수 없음");
      }
    } catch (err) {
      console.error("카메라 스트림 시작 중 오류 발생:", err);
      setError("카메라를 시작할 수 없습니다. 권한을 확인해주세요.");
    }
  };

  // 오디오 스트림 시작 및 오디오 레벨 분석
  const startAudioStream = async (): Promise<void> => {
    try {
      // 기존 오디오 스트림 중지
      if (audioStream) {
        console.log("기존 오디오 스트림 중지 중...");
        audioStream.getTracks().forEach((track) => track.stop());
      }

      // 오디오 컨텍스트 정리
      if (audioContextRef.current) {
        console.log("기존 오디오 컨텍스트 종료 중...");
        audioContextRef.current.close();
      }

      console.log("마이크 연결 시도 중...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedAudio ? { exact: selectedAudio } : undefined,
        },
      });
      console.log("마이크 스트림 획득 성공:", stream);

      setAudioStream(stream);

      // 오디오 레벨 분석 설정
      console.log("오디오 컨텍스트 설정 중...");
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      console.log("오디오 분석 파이프라인 설정 완료");

      // 음소거 상태 설정
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicMuted;
      });
      console.log("마이크 음소거 상태 설정:", isMicMuted);

      // 오디오 레벨 업데이트 시작
      updateAudioLevel();
    } catch (err) {
      console.error("마이크 스트림 시작 중 오류 발생:", err);
      setError("마이크를 시작할 수 없습니다. 권한을 확인해주세요.");
    }
  };

  // 오디오 레벨 업데이트 (볼륨 미터용)
  const updateAudioLevel = (): void => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // 평균 볼륨 레벨 계산
    const average =
      dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    setAudioLevel(average);

    // 애니메이션 프레임 요청
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  // 모든 미디어 스트림 중지
  const stopMediaStreams = (): void => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }

    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
    }

    console.log("모든 미디어 스트림이 중지됨");
  };

  // 마이크 음소거 토글
  const toggleMicrophone = (): void => {
    if (audioStream) {
      const newMuteState = !isMicMuted;
      audioStream.getAudioTracks().forEach((track) => {
        track.enabled = !newMuteState;
      });
      setIsMicMuted(newMuteState);
      console.log("마이크 음소거 상태 변경:", newMuteState);
    }
  };

  // Link 컴포넌트 대신 일반 a 태그와 onClick 핸들러 사용
  const handleNavigation = (path: string): void => {
    if (typeof window !== "undefined") {
      window.location.href = path;
    }
  };

  return (
    <>
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">면접 준비</h2>
        <p className="text-gray-600">
          면접을 시작하기 전에 카메라와 마이크를 테스트해보세요
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="mb-6 rounded-lg bg-gray-100 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-800">
              !
            </div>
            <div>
              <h4 className="font-medium">선택한 질문:</h4>
              <p className="text-sm text-gray-600">
                본인의 강점과 약점에 대해 말씀해 주세요.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                카테고리: 자기소개 | 예상 답변 시간: 2-3분
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-600">
            <p>{error}</p>
          </div>
        )}

        <div className="mb-8 overflow-hidden rounded-lg bg-gray-900 relative">
          {cameraStream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-64 w-full object-cover"
              onLoadedData={handleVideoLoadedData}
            />
          ) : (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center text-white">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 mx-auto">
                  <Camera className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-400">카메라 연결 중...</p>
              </div>
            </div>
          )}

          {/* 마이크 음소거 버튼 */}
          {audioStream && (
            <button
              onClick={toggleMicrophone}
              className="absolute bottom-3 right-3 rounded-full bg-gray-800 p-2 text-white"
            >
              {isMicMuted ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {/* 오디오 레벨 미터 */}
        {audioStream && (
          <div className="mb-6">
            <p className="mb-1 text-sm font-medium">마이크 입력 레벨:</p>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-100"
                style={{ width: `${Math.min(audioLevel, 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {isMicMuted ? "마이크가 음소거되었습니다" : "말을 해보세요!"}
            </p>
          </div>
        )}

        <div className="mb-8 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">카메라</label>
            <select
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={selectedVideo}
              onChange={(e) => setSelectedVideo(e.target.value)}
            >
              {videoDevices.length === 0 && (
                <option value="">카메라를 찾을 수 없음</option>
              )}
              {videoDevices.map((device: MediaDeviceInfo) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `카메라 ${videoDevices.indexOf(device) + 1}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">마이크</label>
            <select
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={selectedAudio}
              onChange={(e) => setSelectedAudio(e.target.value)}
            >
              {audioDevices.length === 0 && (
                <option value="">마이크를 찾을 수 없음</option>
              )}
              {audioDevices.map((device: MediaDeviceInfo) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `마이크 ${audioDevices.indexOf(device) + 1}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => handleNavigation("/interview/single-question")}
            className="rounded-md border border-gray-200 px-6 py-2 text-gray-600 hover:bg-gray-50"
          >
            이전
          </button>
          <button
            onClick={() => handleNavigation("/interview/mock-interview")}
            className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            면접 시작하기
          </button>
        </div>
      </div>
    </>
  );
}

export default PreparePage;
