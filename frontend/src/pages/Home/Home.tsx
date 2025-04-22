import { useState, useEffect, useRef } from "react";

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
  const rippleRefs = useRef<HTMLDivElement[]>([]);

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
    <div className="flex flex-col items-center justify-between h-screen relative ripple-container">
      <div
        ref={(el) => {
          if (el) rippleRefs.current[0] = el;
        }}
        className="ripple"
      ></div>
      <main className="w-screen h-full">
        {/* 현재 배경 - 페이드 인 효과 */}
        <div
          className={`w-full h-full z-[-2] fixed duration-300 ease-in-out transition-opacity background-dark
            ${backgrounds[currentBgIndex]} ${
            isTransitioning
              ? "transition-none opacity-0"
              : "transition-opacity opacity-100"
          }
          `}
        ></div>
        <div
          className={`w-full h-full z-[-3] fixed background-dark ${backgrounds[prevBgIndex]}`}
        ></div>
        <div
          className={`w-[400%] h-full fixed flex transition-transform duration-500 ease-in-out`}
          style={{ transform: `translateX(-${currentBgIndex * 25}%)` }}
        >
          <div className="w-1/4 h-[calc(100%-4rem)] flex flex-col items-center justify-center">
            <div className="w-2/5 h-2/5 mb-6"></div>
            <div className="text-4xl font-gothic">
              <span>인적 사항 입력</span>
            </div>
          </div>
          <div className="w-1/4 h-[calc(100%-4rem)] flex flex-col items-center justify-center">
            <div className="w-2/5 h-2/5 mb-6"></div>
            <div className="text-4xl font-gothic">기업 분석 / 직무 분석</div>
          </div>
          <div className="w-1/4 h-[calc(100%-4rem)] flex flex-col items-center justify-center">
            <div className="w-2/5 h-2/5 mb-6"></div>
            <div className="text-4xl font-gothic">자기소개서 작성</div>
          </div>
          <div className="w-1/4 h-[calc(100%-4rem)] flex flex-col items-center justify-center">
            <div className="w-2/5 h-2/5 mb-6"></div>
            <div className="text-4xl font-gothic">면접 준비</div>
          </div>
        </div>

        {/* 왼쪽 화살표 버튼 */}
        <button
          onClick={handlePrevClick}
          className="absolute left-5 top-1/2 transform -translate-y-1/2 text-white opacity-40 z-10 w-28 h-28 flex items-center justify-center bg-transparent cursor-pointer hover:opacity-50 transition-opacity"
          disabled={isTransitioning}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-28 w-28"
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
          className="absolute right-5 top-1/2 transform -translate-y-1/2 text-white opacity-40 z-10 w-28 h-28 flex items-center justify-center bg-transparent cursor-pointer hover:opacity-50 transition-opacity"
          disabled={isTransitioning}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-28 w-28"
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
      <footer className="flex items-center fixed bottom-0 w-full h-12 bg-gray-950/60">
        <div className="text-white">{currentBgIndex}</div>
      </footer>
    </div>
  );
}

export default Home;
