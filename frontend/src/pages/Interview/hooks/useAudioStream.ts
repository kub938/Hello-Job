import { useState, useEffect, useRef } from "react";

interface UseAudioStreamProps {
  selectedDevice: string | null;
  onError?: (message: string) => void;
  noiseThreshold?: number;
}

interface UseAudioStreamReturn {
  audioStream: MediaStream | null;
  audioLevel: number;
  audioContextRef: React.RefObject<AudioContext | null>;
  analyserRef: React.RefObject<AnalyserNode | null>;
  startStream: () => Promise<void>;
  stopStream: () => void;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => Promise<Blob>;
}

/**
 * 오디오 스트림을 관리하는 커스텀 훅
 * @param selectedDevice 선택된 오디오 장치 ID
 * @param onError 에러 발생 시 호출할 콜백 함수
 * @param noiseThreshold 노이즈 임계값 (이 값 이하의 소리는 무시됨, 기본값: 15)
 * @returns 오디오 스트림, 오디오 레벨, 오디오 컨텍스트 참조, 분석기 참조, 스트림 시작/중지 함수, 녹음 기능
 */
export const useAudioStream = ({
  selectedDevice,
  onError,
  noiseThreshold = 15,
}: UseAudioStreamProps): UseAudioStreamReturn => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 오디오 레벨(볼륨)을 지속적으로 업데이트하는 함수
  const updateAudioLevel = (): void => {
    if (!analyserRef.current || !audioContextRef.current) return;

    // 주파수 데이터를 저장할 Uint8Array 생성
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    // 현재 오디오 주파수 데이터 가져오기
    analyserRef.current.getByteFrequencyData(dataArray);

    // 임계값 이상의 값만 고려하여 평균 계산
    let sum = 0;
    let count = 0;

    dataArray.forEach((value) => {
      if (value > noiseThreshold) {
        sum += value;
        count++;
      }
    });

    // 임계값 이상의 소리가 있을 경우에만 평균 계산, 아니면 0으로 설정
    const average = count > 0 ? sum / count : 0;
    setAudioLevel(average); // 오디오 레벨 상태 업데이트

    // 애니메이션 프레임을 요청하여 다음 프레임에서도 업데이트 계속
    // requestAnimationFrame은 브라우저의 리페인트 전에 호출되어 부드러운 애니메이션 구현
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  // 오디오 스트림을 시작하는 함수
  const startStream = async (): Promise<void> => {
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
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined, // 선택된 장치 ID 지정
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
      onError && onError("마이크를 시작할 수 없습니다. 권한을 확인해주세요.");
    }
  };

  // 스트림 중지 함수
  const stopStream = (): void => {
    if (isRecording) {
      console.log("녹음이 진행중이므로 먼저 녹음을 중지합니다.");
      stopRecording().catch((err) => {
        console.error("녹음 중지 중 오류 발생:", err);
      });
    }

    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
      setAudioStream(null);
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    console.log("오디오 스트림 중지됨");
  };

  // 녹음 시작 함수
  const startRecording = (): void => {
    if (!audioStream) {
      console.error("오디오 스트림이 없어 녹음을 시작할 수 없습니다.");
      onError && onError("마이크가 연결되지 않아 녹음을 시작할 수 없습니다.");
      return;
    }

    if (isRecording) {
      console.log("이미 녹음 중입니다.");
      return;
    }

    try {
      // MediaRecorder 생성 및 설정
      const options = { mimeType: "audio/webm" };
      const recorder = new MediaRecorder(audioStream, options);
      mediaRecorderRef.current = recorder;

      // 녹음 데이터 수집
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 녹음 시작
      recorder.start();
      setIsRecording(true);
      console.log("녹음이 시작되었습니다.");
    } catch (err) {
      console.error("녹음 시작 중 오류 발생:", err);
      onError && onError("녹음을 시작할 수 없습니다.");
    }
  };

  // 녹음 중지 함수
  const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || !isRecording) {
        reject(new Error("녹음이 진행 중이지 않습니다."));
        return;
      }

      // 녹음 종료 이벤트 핸들러
      mediaRecorderRef.current.onstop = () => {
        console.log("녹음이 중지되었습니다.");
        setIsRecording(false);

        // 녹음 데이터를 Blob으로 합치기
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        resolve(audioBlob);
      };

      // 녹음 중지
      mediaRecorderRef.current.stop();
    });
  };

  // 선택된 장치가 변경될 때 스트림 다시 시작
  useEffect(() => {
    if (selectedDevice) {
      console.log("선택된 오디오 장치 변경됨:", selectedDevice);
      startStream();
    }

    // 컴포넌트 언마운트 시 스트림 정리
    return () => {
      stopStream();
    };
  }, [selectedDevice]);

  return {
    audioStream,
    audioLevel,
    audioContextRef,
    analyserRef,
    startStream,
    stopStream,
    isRecording,
    startRecording,
    stopRecording,
  };
};
