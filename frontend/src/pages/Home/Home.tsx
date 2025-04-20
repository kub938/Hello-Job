import { useState, useEffect } from "react";

function Home() {
  const backgrounds = [
    "info-background",
    "analysis-background",
    "introdcution-background",
    "interview-background",
  ];

  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [prevBgIndex, setPrevBgIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300); // 트랜지션이 완료되는 시간과 일치시켜야 함

    return () => clearTimeout(timer);
  }, [isTransitioning]);

  const handlePrevClick = () => {
    if (isTransitioning) return; // 트랜지션 중에 클릭 방지
    //index 변환이 setIsTransitioning보다 먼저 실행된다고 가정했을 때 정상 동작 함.
    setPrevBgIndex(currentBgIndex);
    setCurrentBgIndex((prevIndex) =>
      prevIndex === 0 ? backgrounds.length - 1 : prevIndex - 1
    );
    setIsTransitioning(true);
  };

  const handleNextClick = () => {
    if (isTransitioning) return; // 트랜지션 중에 클릭 방지
    setPrevBgIndex(currentBgIndex);
    setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
    setIsTransitioning(true);
  };

  return (
    <div className="flex flex-col items-center justify-between h-screen relative">
      <main className="w-screen h-full">
        {/* 현재 배경 - 페이드 인 효과 */}
        <div
          className={`w-full h-full z-[-2] fixed background duration-300 ease-in-out transition-opacity ${
            backgrounds[currentBgIndex]
          } ${
            isTransitioning
              ? "transition-none opacity-0"
              : "transition-opacity opacity-100"
          }
          `}
        ></div>
        <div
          className={`w-full h-full z-[-3] fixed background ${backgrounds[prevBgIndex]}`}
        ></div>

        {/* 왼쪽 화살표 버튼 */}
        <button
          onClick={handlePrevClick}
          className="absolute left-5 top-1/2 transform -translate-y-1/2 text-white opacity-50 z-10 w-32 h-32 flex items-center justify-center bg-transparent cursor-pointer hover:opacity-60 transition-opacity"
          disabled={isTransitioning}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-32 w-32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            filter="drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.6))"
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* 오른쪽 화살표 버튼 */}
        <button
          onClick={handleNextClick}
          className="absolute right-5 top-1/2 transform -translate-y-1/2 text-white opacity-50 z-10 w-32 h-32 flex items-center justify-center bg-transparent cursor-pointer hover:opacity-60 transition-opacity"
          disabled={isTransitioning}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-32 w-32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            filter="drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.6))"
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </main>
      <footer className="flex items-center fixed bottom-0 w-full h-16 bg-gray-950/60">
        <div className="text-white">{currentBgIndex}</div>
      </footer>
    </div>
  );
}

export default Home;
