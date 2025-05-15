import { useState, useEffect, useRef } from "react"; // React 훅 가져오기: 상태 관리, 생명주기, 참조 객체 생성에 사용
import { Camera, Mic, MicOff } from "lucide-react"; // Lucide 아이콘 라이브러리에서 카메라와 마이크 관련 아이콘 가져오기

// MediaDevice 관련 타입 정의 - 미디어 장치(카메라, 마이크)의 정보를 저장하는 인터페이스
interface MediaDeviceInfo {
  deviceId: string; // 장치의 고유 식별자
  groupId: string; // 동일한 물리적 장치에 속한 입력/출력 장치를 그룹화하는 식별자
  kind: string; // 장치 유형(videoinput, audioinput 등)
  label: string; // 사용자가 읽을 수 있는 장치 이름
}

function PreparePage() {
  // 상태 관리를 위한 useState 훅 사용
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null); // 카메라 스트림 상태
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null); // 오디오 스트림 상태
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]); // 사용 가능한 카메라 장치 목록
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]); // 사용 가능한 마이크 장치 목록
  const [selectedVideo, setSelectedVideo] = useState<string>(""); // 선택된 카메라 장치 ID
  const [selectedAudio, setSelectedAudio] = useState<string>(""); // 선택된 마이크 장치 ID
  const [audioLevel, setAudioLevel] = useState<number>(0); // 현재 오디오 입력 레벨(볼륨)
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false); // 마이크 음소거 상태
  const [error, setError] = useState<string>(""); // 오류 메시지 상태
  const [_, setIsVideoReady] = useState<boolean>(false); // 비디오가 로딩 완료되었는지 상태

  // useRef 훅을 사용한 참조 객체들
  const videoRef = useRef<HTMLVideoElement | null>(null); // 비디오 요소 DOM 참조
  const audioContextRef = useRef<AudioContext | null>(null); // 오디오 컨텍스트 참조(오디오 처리를 위한 API)
  const analyserRef = useRef<AnalyserNode | null>(null); // 오디오 분석기 노드 참조(볼륨 레벨 분석용)
  const animationFrameRef = useRef<number | null>(null); // requestAnimationFrame ID 저장용 참조

  // 컴포넌트가 마운트될 때 실행되는 useEffect 훅 - 장치 목록 가져오기
  useEffect(() => {
    async function getDevices(): Promise<void> {
      try {
        console.log("미디어 장치 권한 요청 중...");
        // 브라우저에서 사용자에게 카메라와 마이크 접근 권한을 요청
        // 권한이 없으면 장치 목록을 가져올 수 없음
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        console.log("미디어 권한 획득 성공");

        // 모든 미디어 장치 목록 가져오기
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log("모든 미디어 장치:", devices);

        // 장치 목록에서 비디오 입력(카메라)과 오디오 입력(마이크) 장치만 필터링
        const videos = devices.filter(
          (device) => device.kind === "videoinput"
        ) as MediaDeviceInfo[];
        const audios = devices.filter(
          (device) => device.kind === "audioinput"
        ) as MediaDeviceInfo[];

        console.log("발견된 비디오 장치:", videos);
        console.log("발견된 오디오 장치:", audios);

        // 필터링된 장치 목록을 상태에 저장
        setVideoDevices(videos);
        setAudioDevices(audios);

        // 장치가 있으면 첫 번째 장치를 기본값으로 선택
        if (videos.length > 0) setSelectedVideo(videos[0].deviceId);
        if (audios.length > 0) setSelectedAudio(audios[0].deviceId);
      } catch (err) {
        console.error("장치 목록을 가져오는 중 오류 발생:", err);
        setError("카메라 또는 마이크 접근 권한이 필요합니다.");
      }
    }

    getDevices(); // 함수 호출

    // 컴포넌트 언마운트 시 정리(clean-up) 함수 - 메모리 누수 방지
    return () => {
      stopMediaStreams(); // 모든 미디어 스트림 중지
      if (audioContextRef.current) {
        audioContextRef.current.close(); // 오디오 컨텍스트 종료
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current); // 애니메이션 프레임 취소
      }
    };
  }, []); // 빈 배열을 전달하여 컴포넌트 마운트 시에만 실행

  // 선택된 비디오 장치가 변경될 때 스트림 업데이트하는 useEffect 훅
  useEffect(() => {
    if (selectedVideo) {
      console.log("선택된 비디오 장치 변경됨:", selectedVideo);
      startVideoStream(); // 새 비디오 스트림 시작
    }
  }, [selectedVideo]); // selectedVideo 상태가 변경될 때마다 실행

  // 선택된 오디오 장치가 변경될 때 스트림 업데이트하는 useEffect 훅
  useEffect(() => {
    if (selectedAudio) {
      console.log("선택된 오디오 장치 변경됨:", selectedAudio);
      startAudioStream(); // 새 오디오 스트림 시작
    }
  }, [selectedAudio]); // selectedAudio 상태가 변경될 때마다 실행

  // 비디오 요소가 데이터를 로드했을 때 호출되는 이벤트 핸들러
  const handleVideoLoadedData = () => {
    console.log("비디오 데이터 로드됨");
    setIsVideoReady(true); // 비디오 준비 완료 상태로 설정
  };

  // 비디오 스트림을 시작하는 함수
  const startVideoStream = async (): Promise<void> => {
    try {
      // 기존 비디오 스트림이 있으면 중지(리소스 정리)
      if (cameraStream) {
        console.log("기존 카메라 스트림 중지 중...");
        cameraStream.getTracks().forEach((track) => track.stop());
      }

      console.log("카메라 연결 시도 중...");
      // 선택된 카메라 장치로 미디어 스트림 요청
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedVideo ? { exact: selectedVideo } : undefined, // 선택된 장치 ID 지정
        },
      });
      console.log("카메라 스트림 획득 성공:", stream);

      setCameraStream(stream); // 카메라 스트림 상태 업데이트
      setIsVideoReady(false); // 새 스트림이 로드될 때까지 준비 상태 false로 설정

      // 비디오 요소에 스트림 연결
      if (videoRef.current) {
        videoRef.current.srcObject = stream; // 비디오 요소의 srcObject에 스트림 할당
        console.log("비디오 요소에 스트림 연결됨");
      } else {
        console.error("비디오 요소 참조를 찾을 수 없음");
      }
    } catch (err) {
      console.error("카메라 스트림 시작 중 오류 발생:", err);
      setError("카메라를 시작할 수 없습니다. 권한을 확인해주세요.");
    }
  };

  // 오디오 스트림을 시작하고 오디오 레벨 분석을 설정하는 함수
  const startAudioStream = async (): Promise<void> => {
    try {
      // 기존 오디오 스트림이 있으면 중지(리소스 정리)
      if (audioStream) {
        console.log("기존 오디오 스트림 중지 중...");
        audioStream.getTracks().forEach((track) => track.stop());
      }

      // 기존 오디오 컨텍스트가 있으면 종료(리소스 정리)
      if (audioContextRef.current) {
        console.log("기존 오디오 컨텍스트 종료 중...");
        audioContextRef.current.close();
      }

      console.log("마이크 연결 시도 중...");
      // 선택된 마이크 장치로 미디어 스트림 요청
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedAudio ? { exact: selectedAudio } : undefined, // 선택된 장치 ID 지정
        },
      });
      console.log("마이크 스트림 획득 성공:", stream);

      setAudioStream(stream); // 오디오 스트림 상태 업데이트

      // 오디오 레벨 분석을 위한 Web Audio API 설정
      console.log("오디오 컨텍스트 설정 중...");
      // AudioContext 생성(크로스 브라우저 호환성을 위한 웹킷 접두사 처리)
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      // 오디오 분석기 노드 생성 및 설정
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256; // FFT(고속 푸리에 변환) 크기 설정 - 주파수 분석을 위한 샘플 수

      // 오디오 스트림을 오디오 컨텍스트 소스로 연결
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser); // 소스를 분석기에 연결
      console.log("오디오 분석 파이프라인 설정 완료");

      // 현재 음소거 상태에 따라 오디오 트랙 활성화/비활성화
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicMuted; // enabled = false면 음소거
      });
      console.log("마이크 음소거 상태 설정:", isMicMuted);

      // 오디오 레벨 업데이트 시작
      updateAudioLevel();
    } catch (err) {
      console.error("마이크 스트림 시작 중 오류 발생:", err);
      setError("마이크를 시작할 수 없습니다. 권한을 확인해주세요.");
    }
  };

  // 오디오 레벨(볼륨)을 지속적으로 업데이트하는 함수
  const updateAudioLevel = (): void => {
    if (!analyserRef.current || !audioContextRef.current) return;

    // 주파수 데이터를 저장할 Uint8Array 생성
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    // 현재 오디오 주파수 데이터 가져오기
    analyserRef.current.getByteFrequencyData(dataArray);

    // 모든 주파수 값의 평균을 계산하여 오디오 레벨 결정
    const average =
      dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    setAudioLevel(average); // 오디오 레벨 상태 업데이트

    // 애니메이션 프레임을 요청하여 다음 프레임에서도 업데이트 계속
    // requestAnimationFrame은 브라우저의 리페인트 전에 호출되어 부드러운 애니메이션 구현
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  // 모든 미디어 스트림을 중지하는 함수
  const stopMediaStreams = (): void => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }

    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
    }

    console.log("모든 미디어 스트림이 중지됨");
  };

  // 마이크 음소거 상태를 토글하는 함수
  const toggleMicrophone = (): void => {
    if (audioStream) {
      const newMuteState = !isMicMuted;
      // 오디오 트랙의 enabled 속성을 변경하여 음소거 처리
      audioStream.getAudioTracks().forEach((track) => {
        track.enabled = !newMuteState; // true면 활성화, false면 비활성화(음소거)
      });
      setIsMicMuted(newMuteState); // 음소거 상태 업데이트
      console.log("마이크 음소거 상태 변경:", newMuteState);
    }
  };

  // 다른 페이지로 이동하는 함수 (React Router의 Link 대신 사용)
  const handleNavigation = (path: string): void => {
    if (typeof window !== "undefined") {
      window.location.href = path; // 브라우저 URL을 변경하여 페이지 이동
    }
  };

  return (
    <>
      {/* 페이지 제목 및 안내 텍스트 */}
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">면접 준비</h2>
        <p className="text-gray-600">
          면접을 시작하기 전에 카메라와 마이크를 테스트해보세요
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        {/* 선택한 질문 정보 표시 */}
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

        {/* 오류 메시지 표시 */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-600">
            <p>{error}</p>
          </div>
        )}

        {/* 비디오 미리보기 영역 */}
        <div className="mb-8 overflow-hidden h-120 rounded-lg bg-gray-900 relative">
          <video
            ref={videoRef} // DOM 요소 참조 연결
            autoPlay // 자동 재생
            playsInline // 모바일에서 인라인 재생(전체 화면 방지)
            muted // 오디오 음소거(피드백 방지)
            className="h-full w-full object-cover"
            onLoadedData={handleVideoLoadedData} //  비디오 데이터 로드 완료 이벤트 핸들러
          />
          {cameraStream ? (
            <></>
          ) : (
            // 카메라 스트림이 없으면 로딩 표시
            <div className="flex h-120 items-center justify-center absolute top-0 left-0 w-full">
              <div className="text-center text-white">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 mx-auto">
                  <Camera className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-400">카메라 연결 중...</p>
              </div>
            </div>
          )}

          {/* 마이크 음소거 버튼 - 오디오 스트림이 있을 때만 표시 */}
          {audioStream && (
            <button
              onClick={toggleMicrophone}
              className="absolute bottom-3 right-3 rounded-full bg-gray-800 p-2 text-white"
            >
              {isMicMuted ? (
                <MicOff className="h-5 w-5" /> // 음소거 상태면 MicOff 아이콘
              ) : (
                <Mic className="h-5 w-5" /> // 음소거 아닌 상태면 Mic 아이콘
              )}
            </button>
          )}
        </div>

        {/* 오디오 레벨 미터 - 오디오 스트림이 있을 때만 표시 */}
        {audioStream && (
          <div className="mb-6">
            <p className="mb-1 text-sm font-medium">마이크 입력 레벨:</p>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-100"
                style={{ width: `${Math.min(audioLevel, 100)}%` }} // 오디오 레벨에 따라 너비 조정(최대 100%)
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {isMicMuted ? "마이크가 음소거되었습니다" : "말을 해보세요!"}
            </p>
          </div>
        )}

        {/* 장치 선택 영역 */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          {/* 카메라 선택 드롭다운 */}
          <div>
            <label className="mb-2 block text-sm font-medium">카메라</label>
            <select
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={selectedVideo}
              onChange={(e) => setSelectedVideo(e.target.value)} // 선택 변경 시 상태 업데이트
            >
              {videoDevices.length === 0 && (
                <option value="">카메라를 찾을 수 없음</option>
              )}
              {videoDevices.map((device: MediaDeviceInfo) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `카메라 ${videoDevices.indexOf(device) + 1}`}{" "}
                  {/* 장치 레이블이 없으면 번호로 표시 */}
                </option>
              ))}
            </select>
          </div>
          {/* 마이크 선택 드롭다운 */}
          <div>
            <label className="mb-2 block text-sm font-medium">마이크</label>
            <select
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={selectedAudio}
              onChange={(e) => setSelectedAudio(e.target.value)} // 선택 변경 시 상태 업데이트
            >
              {audioDevices.length === 0 && (
                <option value="">마이크를 찾을 수 없음</option>
              )}
              {audioDevices.map((device: MediaDeviceInfo) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `마이크 ${audioDevices.indexOf(device) + 1}`}{" "}
                  {/* 장치 레이블이 없으면 번호로 표시 */}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between">
          {/* 이전 페이지 버튼 */}
          <button
            onClick={() => handleNavigation("/interview/single-question")}
            className="rounded-md border border-gray-200 px-6 py-2 text-gray-600 hover:bg-gray-50"
          >
            이전
          </button>
          {/* 면접 시작 버튼 */}
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
