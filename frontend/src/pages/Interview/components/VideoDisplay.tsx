import { Camera } from "lucide-react";

interface VideoDisplayProps {
  cameraStream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onVideoLoadedData: () => void;
  height: number;
}

function VideoDisplay({
  cameraStream,
  videoRef,
  onVideoLoadedData,
  height,
}: VideoDisplayProps) {
  return (
    <div
      className="overflow-hidden rounded-lg bg-gray-900 relative"
      style={{ height: height }}
    >
      <video
        ref={videoRef} // DOM 요소 참조 연결
        autoPlay // 자동 재생
        playsInline // 모바일에서 인라인 재생(전체 화면 방지)
        muted // 오디오 음소거(피드백 방지)
        className="w-full h-full object-cover"
        onLoadedData={onVideoLoadedData} //  비디오 데이터 로드 완료 이벤트 핸들러
      />
      {cameraStream ? (
        <></>
      ) : (
        // 카메라 스트림이 없으면 로딩 표시
        <div className="flex items-center justify-center absolute top-0 left-0 w-full h-full rounded-lg">
          <div className="text-center text-white">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 mx-auto">
              <Camera className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-400">카메라 연결 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoDisplay;
