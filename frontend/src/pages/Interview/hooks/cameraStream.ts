import { useState, useEffect, useRef, RefObject } from "react";

interface UseCameraStreamProps {
  selectedDevice: string | null;
  onError?: (message: string) => void;
}

interface UseCameraStreamReturn {
  cameraStream: MediaStream | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  isVideoReady: boolean;
  startStream: () => Promise<void>;
  stopStream: () => void;
}

/**
 * 카메라 스트림을 관리하는 커스텀 훅
 * @param selectedDevice 선택된 카메라 장치 ID
 * @param onError 에러 발생 시 호출할 콜백 함수
 * @returns 카메라 스트림, 비디오 요소 참조, 비디오 준비 상태, 스트림 시작/중지 함수
 */
export const useCameraStream = ({
  selectedDevice,
  onError,
}: UseCameraStreamProps): UseCameraStreamReturn => {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 비디오 요소가 데이터를 로드했을 때 호출되는 이벤트 핸들러
  const handleVideoLoadedData = () => {
    console.log("비디오 데이터 로드됨");
    setIsVideoReady(true); // 비디오 준비 완료 상태로 설정
  };

  // 비디오 스트림을 시작하는 함수
  const startStream = async (): Promise<void> => {
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
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined, // 선택된 장치 ID 지정
        },
      });
      console.log("카메라 스트림 획득 성공:", stream);

      setCameraStream(stream); // 카메라 스트림 상태 업데이트
      setIsVideoReady(false); // 새 스트림이 로드될 때까지 준비 상태 false로 설정

      // 비디오 요소에 스트림 연결
      if (videoRef.current) {
        videoRef.current.srcObject = stream; // 비디오 요소의 srcObject에 스트림 할당
        videoRef.current.onloadeddata = handleVideoLoadedData;
        console.log("비디오 요소에 스트림 연결됨");
      } else {
        console.error("비디오 요소 참조를 찾을 수 없음");
      }
    } catch (err) {
      console.error("카메라 스트림 시작 중 오류 발생:", err);
      onError && onError("카메라를 시작할 수 없습니다. 권한을 확인해주세요.");
    }
  };

  // 스트림 중지 함수
  const stopStream = (): void => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      console.log("카메라 스트림 중지됨");
    }
  };

  // 선택된 장치가 변경될 때 스트림 다시 시작
  useEffect(() => {
    if (selectedDevice) {
      console.log("선택된 비디오 장치 변경됨:", selectedDevice);
      startStream();
    }

    // 컴포넌트 언마운트 시 스트림 정리
    return () => {
      stopStream();
    };
  }, [selectedDevice]);

  return {
    cameraStream,
    videoRef,
    isVideoReady,
    startStream,
    stopStream,
  };
};
