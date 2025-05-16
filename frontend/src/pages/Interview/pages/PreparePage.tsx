import { useState, useEffect, useRef } from "react"; // React 훅 가져오기: 상태 관리, 생명주기, 참조 객체 생성에 사용
import {
  useAudioDeviceStore,
  useCameraDeviceStore,
  useSpeakerDeviceStore,
} from "@/store/deviceStore";
import { Button } from "@/components/Button";
import VideoDisplay from "../components/VideoDisplay";
import { useCameraStream } from "../hooks/cameraStream";
import { useStartInterview } from "@/hooks/interviewHooks";
import { useInterviewStore } from "@/store/interviewStore";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

// MediaDevice 관련 타입 정의 - 미디어 장치(카메라, 마이크)의 정보를 저장하는 인터페이스
interface MediaDeviceInfo {
  deviceId: string; // 장치의 고유 식별자
  groupId: string; // 동일한 물리적 장치에 속한 입력/출력 장치를 그룹화하는 식별자
  kind: string; // 장치 유형(videoinput, audioinput 등)
  label: string; // 사용자가 읽을 수 있는 장치 이름
}

function PreparePage() {
  const {
    videoDevices, //사용 가능한 카메라 장치 목록
    setVideoDevices,
    selectedVideo, //선택된 카메라 장치 ID
    setSelectedVideo,
  } = useCameraDeviceStore();

  // useCameraStream 훅 사용
  const { cameraStream, videoRef } = useCameraStream({
    selectedDevice: selectedVideo,
    onError: (message) => setError(message),
  });

  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  const { audioDevices, setAudioDevices, selectedAudio, setSelectedAudio } =
    useAudioDeviceStore();

  const {
    speakerDevices,
    setSpeakerDevices,
    selectedSpeaker,
    setSelectedSpeaker,
  } = useSpeakerDeviceStore();

  const navigate = useNavigate();

  const [audioLevel, setAudioLevel] = useState<number>(0); // 현재 오디오 입력 레벨(볼륨)
  const [error, setError] = useState<string>(""); // 오류 메시지 상태

  const [isAudioTest, setIsAudioTest] = useState<boolean>(false); // 오디오 테스트 상태

  // 테스트용 오디오 연결을 저장할 참조 객체 추가
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(
    null
  );
  const delayNodeRef = useRef<DelayNode | null>(null);
  const testAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null); // 출력 음량 분석을 위한 추가 참조

  const handleTestAudio = () => {
    // 다음 상태의 반대값을 미리 계산
    const nextAudioTestState = !isAudioTest;
    setIsAudioTest(nextAudioTestState);

    // 오디오 테스트 상태에 따른 동작
    if (nextAudioTestState) {
      // 오디오 테스트 시작 - 마이크 켜기
      if (audioStream && selectedSpeaker) {
        // 오디오 컨텍스트가 없으면 새로 생성
        if (!audioContextRef.current) {
          const AudioContextClass =
            window.AudioContext || (window as any).webkitAudioContext;
          audioContextRef.current = new AudioContextClass();
        }

        const audioCtx = audioContextRef.current;

        // 마이크 입력을 오디오 컨텍스트의 소스로 연결
        audioSourceRef.current = audioCtx.createMediaStreamSource(audioStream);

        // 지연 노드 생성 (1초 지연)
        delayNodeRef.current = audioCtx.createDelay(3.0);
        delayNodeRef.current.delayTime.value = 1.0; // 1초 지연

        // 출력 음량 분석을 위한 분석기 노드 생성
        outputAnalyserRef.current = audioCtx.createAnalyser();
        outputAnalyserRef.current.fftSize = 256;

        // 오디오 출력 대상 생성
        audioDestinationRef.current = audioCtx.createMediaStreamDestination();

        // 노드들을 연결: 소스 -> 지연 -> 분석기 -> 출력
        audioSourceRef.current.connect(delayNodeRef.current);
        delayNodeRef.current.connect(outputAnalyserRef.current);
        outputAnalyserRef.current.connect(audioDestinationRef.current);

        // 오디오 요소 생성 및 출력 스트림 설정
        const audioElement = new Audio();
        audioElement.srcObject = audioDestinationRef.current.stream;
        testAudioElementRef.current = audioElement;

        // 오디오 요소에 선택된 스피커 설정
        if (typeof audioElement.setSinkId !== "undefined") {
          audioElement
            .setSinkId(selectedSpeaker)
            .then(() => {
              console.log("테스트 오디오의 출력 장치가 성공적으로 설정됨");
              audioElement
                .play()
                .catch((err) => console.error("오디오 재생 실패:", err));

              // 출력 레벨 업데이트 시작
              updateOutputLevel();
            })
            .catch((err) => console.error("출력 장치 설정 실패:", err));
        } else {
          console.warn(
            "이 브라우저는 오디오 출력 장치 선택을 지원하지 않습니다."
          );
          audioElement
            .play()
            .catch((err) => console.error("오디오 재생 실패:", err));

          // 출력 레벨 업데이트 시작
          updateOutputLevel();
        }

        console.log("오디오 테스트 시작됨");
      } else {
        console.error("마이크 또는 스피커가 선택되지 않았습니다.");
        setIsAudioTest(false); // 오류 시 상태 되돌림
      }
    } else {
      // 오디오 테스트 종료 - 마이크 끄기
      if (testAudioElementRef.current) {
        testAudioElementRef.current.pause();
        testAudioElementRef.current.srcObject = null;
        testAudioElementRef.current = null;
      }

      // 애니메이션 프레임 취소
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // 오디오 연결 해제
      if (outputAnalyserRef.current) {
        outputAnalyserRef.current.disconnect();
        outputAnalyserRef.current = null;
      }

      if (delayNodeRef.current) {
        delayNodeRef.current.disconnect();
        delayNodeRef.current = null;
      }

      if (audioSourceRef.current) {
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
      }

      if (audioDestinationRef.current) {
        audioDestinationRef.current.disconnect();
        audioDestinationRef.current = null;
      }

      // 테스트 종료 후 마이크 입력 레벨 측정으로 복귀
      if (!isAudioTest && analyserRef.current) {
        updateAudioLevel();
      }

      console.log("오디오 테스트 종료됨");
    }
  };

  // useRef 훅을 사용한 참조 객체들
  const audioContextRef = useRef<AudioContext | null>(null); // 오디오 컨텍스트 참조(오디오 처리를 위한 API)
  const analyserRef = useRef<AnalyserNode | null>(null); // 오디오 분석기 노드 참조(볼륨 레벨 분석용)
  const animationFrameRef = useRef<number | null>(null); // requestAnimationFrame ID 저장용 참조

  // 면접 시작 훅
  //location 완전 모의면접/ 단일 문항 연습 구분 한 뒤에 다음 버튼 눌렀을 때 훅 부를지 말지 선택
  const location = useLocation();
  const { selectCategory, selectInterviewType, selectCoverLetterId } =
    useInterviewStore();
  const startInterviewMutation = useStartInterview();

  const handleStartInterview = () => {
    if (selectInterviewType === "question") {
      const locationState = location.state;
      console.log(locationState);
      navigate("/interview/practice", { state: locationState });
    } else if (selectInterviewType === "practice") {
      const mutationData =
        selectCategory === "cover-letter" && selectCoverLetterId
          ? { category: selectCategory, coverLetterId: selectCoverLetterId }
          : { category: selectCategory };

      startInterviewMutation.mutate(mutationData, {
        onSuccess: (response) => {
          navigate("/interview/practice", {
            state: { response },
          });
        },
        onError: (error) => {
          console.log("면접 시작 오류", error);
          toast.error("면접을 정상적으로 실행할 수 없습니다.");
        },
      });
    } else {
      alert("면접 유형을 선택해 주세요");
      navigate("/interview/select");
    }
  };
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
        //스피커 장치 찾기
        const speakers = devices.filter(
          (device) => device.kind === "audiooutput"
        ) as MediaDeviceInfo[];

        console.log("발견된 비디오 장치:", videos);
        console.log("발견된 오디오 장치:", audios);
        console.log("발견된 스피커 장치:", speakers);

        // 필터링된 장치 목록을 상태에 저장
        setVideoDevices(videos);
        setAudioDevices(audios);
        setSpeakerDevices(speakers);

        // 장치가 있으면 첫 번째 장치를 기본값으로 선택
        if (videos.length > 0) setSelectedVideo(videos[0].deviceId);
        if (audios.length > 0) setSelectedAudio(audios[0].deviceId);
        if (speakers.length > 0) setSelectedSpeaker(speakers[0].deviceId);
      } catch (err) {
        console.error("장치 목록을 가져오는 중 오류 발생:", err);
        setError("카메라 또는 마이크 접근 권한이 필요합니다.");
      }
    }

    getDevices(); // 함수 호출

    // 컴포넌트 언마운트 시 정리(clean-up) 함수 - 메모리 누수 방지
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close(); // 오디오 컨텍스트 종료
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current); // 애니메이션 프레임 취소
      }
    };
  }, []); // 빈 배열을 전달하여 컴포넌트 마운트 시에만 실행

  // 선택된 오디오 장치가 변경될 때 스트림 업데이트하는 useEffect 훅
  useEffect(() => {
    if (selectedAudio) {
      console.log("선택된 오디오 장치 변경됨:", selectedAudio);
      startAudioStream(); // 새 오디오 스트림 시작
    }
  }, [selectedAudio]); // selectedAudio 상태가 변경될 때마다 실행

  //선택된 스피커 장치가 변경될 때.
  useEffect(() => {
    if (selectedSpeaker) {
      console.log("선택된 스피커 장치 변경됨:", selectedSpeaker);

      // 브라우저가 setSinkId API를 지원하는지 확인
      if (typeof HTMLMediaElement.prototype.setSinkId !== "undefined") {
        // 현재 페이지의 모든 오디오/비디오 요소 찾기
        const mediaElements = document.querySelectorAll("video, audio");

        // 각 미디어 요소의 출력 장치 변경
        mediaElements.forEach((element: any) => {
          if (element.setSinkId) {
            element
              .setSinkId(selectedSpeaker)
              .then(() => {
                console.log("출력 장치가 성공적으로 변경됨");
              })
              .catch((err: Error) => {
                console.error("출력 장치 변경 실패:", err);
                setError("스피커 변경 중 오류가 발생했습니다.");
              });
          }
        });
      } else {
        console.warn(
          "이 브라우저는 오디오 출력 장치 선택을 지원하지 않습니다."
        );
      }
    }
  }, [selectedSpeaker]); // selectedSpeaker 상태가 변경될 때마다 실행

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

  // 오디오 출력 레벨(볼륨)을 지속적으로 업데이트하는 함수
  const updateOutputLevel = (): void => {
    if (!outputAnalyserRef.current || !audioContextRef.current) return;

    // 주파수 데이터를 저장할 Uint8Array 생성
    const dataArray = new Uint8Array(
      outputAnalyserRef.current.frequencyBinCount
    );
    // 현재 오디오 주파수 데이터 가져오기
    outputAnalyserRef.current.getByteFrequencyData(dataArray);

    // 모든 주파수 값의 평균을 계산하여 오디오 레벨 결정
    const average =
      dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    setAudioLevel(average); // 오디오 레벨 상태 업데이트

    // 애니메이션 프레임을 요청하여 다음 프레임에서도 업데이트 계속
    animationFrameRef.current = requestAnimationFrame(updateOutputLevel);
  };

  // 다른 페이지로 이동하는 함수 (React Router의 Link 대신 사용)
  const handleNavigation = (path: string): void => {
    navigate(path);
  };

  // 비디오 로딩 완료 이벤트 핸들러
  const handleVideoLoadedData = () => {
    console.log("비디오 데이터 로드됨");
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
        {/* 오류 메시지 표시 */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-600">
            <p>{error}</p>
          </div>
        )}

        {/* 카메라 선택 드롭다운 */}
        <h1 className="mb-4 text-xl  font-bold">1. 비디오 설정</h1>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">카메라</label>
          <select
            className="w-1/2 rounded-md border border-gray-300 p-2 text-sm"
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
        {/* 비디오 미리보기 영역 */}
        <VideoDisplay
          cameraStream={cameraStream}
          videoRef={videoRef}
          onVideoLoadedData={handleVideoLoadedData}
          height={420}
        />

        <h1 className="mt-6 mb-4 text-xl font-bold">2. 음성 설정</h1>
        {/* 장치 선택 영역 */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          {/* 마이크 선택 드롭다운 */}
          <div>
            <label className="mb-2 block text-sm font-medium">녹음장치</label>
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
          {/* 스피커 선택 드롭다운 */}
          <div>
            <label className="mb-2 block text-sm font-medium">출력장치</label>
            <select
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)} // 선택 변경 시 상태 업데이트
            >
              {speakerDevices.length === 0 && (
                <option value="">스피커를 찾을 수 없음</option>
              )}
              {speakerDevices.map((device: MediaDeviceInfo) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label ||
                    `스피커 ${speakerDevices.indexOf(device) + 1}`}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* 오디오 레벨 미터 - 오디오 스트림이 있을 때만 표시 */}
        {audioStream && (
          <div className="mb-6">
            <p className=" mb-1 text-sm font-medium">마이크 테스트하기:</p>
            <div className="flex items-center gap-2">
              <Button onClick={handleTestAudio} className="w-[110px]">
                {isAudioTest ? "테스트 중지하기" : "들어보기"}
              </Button>
              <div className="flex-1">
                <div className="h-4"></div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-100"
                    style={{ width: `${Math.min(audioLevel, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {isAudioTest
                    ? "출력 음성이 명확하게 들리나요?"
                    : "자신감 있는 목소리가 담기고 있나요?"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between mt-10">
          {/* 이전 페이지 버튼 */}
          <button
            onClick={() => handleNavigation("/interview/single-question")}
            className="rounded-md border border-gray-200 px-6 py-2 text-gray-600 hover:bg-gray-50"
          >
            이전
          </button>
          {/* 면접 시작 버튼 */}
          <Button
            className="rounded-md px-6 py-2 text-white"
            onClick={handleStartInterview}
          >
            면접 시작하기
          </Button>
        </div>
      </div>
    </>
  );
}

export default PreparePage;
