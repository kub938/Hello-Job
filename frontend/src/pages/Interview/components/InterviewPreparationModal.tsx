import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/Button";
import { QuestionList } from "@/types/interviewApiTypes";

// CSS 스타일 추가
const styles = `
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap');


  body {
    background-color: #F8F9FC;
    color: #2A2C35;
    margin: 0;
    padding: 0;
  }

  .timer-animation {
    transition: stroke-dashoffset 1s linear;
  }

  .pulse-animation {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      opacity: 1;
    }
  }

  .countdown-animate {
    animation: countdown 1s linear;
  }

  @keyframes countdown {
    0% {
      transform: scale(1);
    }
    20% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  
`;

interface PracticeInterviewPage {
  onStart: () => void;
  questions: QuestionList[];
  nowQuestionNumber: number;
}

const InterviewPreparationPage = ({
  onStart,
  questions,
  nowQuestionNumber,
}: PracticeInterviewPage) => {
  // 30초 타이머 설정
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // 타이머 로직
  useEffect(() => {
    if (isPaused) return;

    if (timeLeft <= 0) {
      // 시간이 다 되면 다음 단계로 이동
      handleProceed();
      return;
    }

    // 매끄러운 숫자 애니메이션을 위한 RAF 사용
    // timerRef.current = requestAnimationFrame(() => {
    //   setAnimatedNumber(timeLeft);
    // });

    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => {
      clearInterval(timerInterval);
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, [timeLeft, isPaused]);

  // 원형 프로그레스 계산
  const calculateProgress = () => {
    const totalTime = 30; // 총 준비 시간
    const progress = (timeLeft / totalTime) * 100;

    // SVG 원의 둘레 계산 (2 * π * 반지름)
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const dashoffset = circumference * (1 - progress / 100);

    return {
      progress,
      circumference,
      dashoffset,
    };
  };

  const { circumference, dashoffset } = calculateProgress();

  // 색상 계산 - 시간에 따라 색상 변경
  const getColorByTime = () => {
    if (timeLeft > 20) return "#886BFB"; // 프라이머리 컬러
    if (timeLeft > 10) return "#FF9500"; // 경고 색상
    return "#FF3B30"; // 위험 색상
  };

  // 답변 시작 함수
  const handleProceed = () => {
    onStart();
    setIsPaused(true);
  };

  // 준비 시간 건너뛰기
  // const handleSkip = () => {
  //   setIsPaused(true);
  //   handleProceed();
  // };

  return (
    <>
      <style>{styles}</style>
      <div className="modal-overlay bg-black/90">
        <div className="flex flex-col">
          <div className="flex-1 p-6 flex">
            <div className="flex-1 flex justify-center">
              <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8 flex flex-col items-center border border-[#E4E8F0]">
                <h1 className="border-b pb-2 mb-4 w-full text-xl font-bold ">
                  질문을 확인하고 준비가 완료되면 준비 완료 버튼을 눌러주세요!
                </h1>

                <div className="w-full px-7 bg-[#F8F9FC] border-l-4 border-l-primary rounded-lg py-3 mb-8 border border-[#E4E8F0] relative">
                  <div className="inline-block bg-[#F1F3F9] px-3 py-1 rounded-full text-xs font-medium text-[#6E7180] mb-3">
                    질문 {nowQuestionNumber + 1} / {questions.length}
                  </div>

                  <h3 className="text-xl font-semibold text-[#2A2C35] mb-4">
                    {questions[nowQuestionNumber].question}
                  </h3>
                </div>

                {/* 원형 타이머 */}
                <div className="relative w-40 h-40 mb-10">
                  <svg className="w-full h-full" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="60" fill="#F1F3F9" />
                    <circle
                      cx="70"
                      cy="70"
                      r="60"
                      fill="none"
                      stroke={getColorByTime()}
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashoffset}
                      transform="rotate(-90 70 70)"
                      className="timer-animation"
                    />
                    <text
                      x="70"
                      y="65"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`text-4xl font-bold ${
                        timeLeft <= 10 ? "countdown-animate" : ""
                      }`}
                      style={{ fill: getColorByTime() }}
                    >
                      {timeLeft}
                    </text>
                    <text
                      x="70"
                      y="95"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-sm text-[#6E7180]"
                    >
                      남은 준비시간
                    </text>
                  </svg>
                </div>
                <div className="bg-background flex flex-col justify-center p-5 w-full rounded-xl mb-4">
                  <div className="text-accent font-bold">TIP!</div>
                  <div className="text-sm">
                    생각을 정리하고 구체적인 사례를 준비하세요.
                  </div>
                  <div className="text-sm">
                    답변이 준비되면 언제든지 준비 완료 버튼을 눌러 시작할 수
                    있습니다.
                  </div>
                </div>
                {/* 질문 카드 */}

                {/* 가이드 */}
                {/* <div className="w-full mb-10 bg-[#F8F9FC] p-5 rounded-lg border border-[#E4E8F0]">
                <h3 className="text-base font-medium text-[#6E7180] mb-3 text-center">
                  답변 준비를 위한 가이드
                </h3>
                <ul className="text-[#2A2C35] space-y-3">
                  <li className="flex items-start">
                    <span className="text-[#886BFB] mr-2">•</span>
                    <span>구체적인 상황, 행동, 결과를 포함해 답변하세요.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#886BFB] mr-2">•</span>
                    <span>
                      실제 경험이 없다면, 가상의 상황을 설정해 답변해도
                      좋습니다.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#886BFB] mr-2">•</span>
                    <span>
                      면접관의 질문 의도를 파악하고 답변하는 것이 중요합니다.
                    </span>
                  </li>
                </ul>
              </div> */}

                {/* 버튼 */}
                <Button onClick={handleProceed} className="w-33 h-15 text-lg">
                  준비 완료
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InterviewPreparationPage;
