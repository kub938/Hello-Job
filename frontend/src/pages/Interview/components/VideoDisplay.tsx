import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VideoDisplayProps {
  cameraStream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onVideoLoadedData: () => void;
}

function VideoDisplay({
  cameraStream,
  videoRef,
  onVideoLoadedData,
}: VideoDisplayProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // 드래그 시작 처리
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // 마우스 우클릭일 경우 무시
    if (e.button === 2) return;

    // 클릭 위치와 현재 위치의 차이 계산
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);

    // 기본 동작 방지 (텍스트 선택 등)
    e.preventDefault();
  };

  // 드래그 중 처리
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();

    // 새 위치 계산
    let newX = e.clientX - container.left - dragOffset.x;
    let newY = e.clientY - container.top - dragOffset.y;

    // 비디오 요소의 크기 가져오기 (videoRef가 null이 아니고 current가 존재할 때)
    let videoWidth = 0;
    let videoHeight = 0;

    if (videoRef.current) {
      videoWidth = videoRef.current.offsetWidth;
      videoHeight = videoRef.current.offsetHeight;
    }

    // 경계 체크 (컨테이너 밖으로 나가지 않도록)
    newX = Math.max(0, Math.min(newX, container.width - videoWidth));
    newY = Math.max(0, Math.min(newY, container.height - videoHeight));

    setPosition({ x: newX, y: newY });
  };

  // 드래그 종료 처리
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 마우스 이벤트 리스너 등록 및 해제
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full  overflow-hidden rounded-lg bg-gray-900 relative"
    >
      <div
        className="absolute"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? "grabbing" : "grab",
          width: "100%",
          height: "100%",
        }}
        onMouseDown={handleMouseDown}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          onLoadedData={onVideoLoadedData}
        />
      </div>
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
