import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/Button";
import { QuestionList } from "@/types/interviewApiTypes";
import { InterviewType } from "@/store/interviewStore";

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
  type: InterviewType;
}

const InterviewPreparationPage = ({
  onStart,
  questions,
  nowQuestionNumber,
  type,
}: PracticeInterviewPage) => {
  // 30초 타이머 설정
  const [timeLeft, setTimeLeft] = useState(type === "practice" ? 5 : 30);
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
    const totalTime = type === "practice" ? 5 : 30; // 총 준비 시간
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
                  {type === "question"
                    ? "질문을 확인하고 준비가 완료되면 준비 완료 버튼을 눌러주세요!"
                    : "곧 다음 문항이 시작됩니다!"}
                </h1>

                <div className="w-full flex flex-col px-7 bg-[#F8F9FC] border-l-4 border-l-primary rounded-lg py-3 mb-8 border border-[#E4E8F0] relative">
                  {type === "question" && (
                    <div className="flex w-20 justify-center bg-[#F1F3F9] px-3 py-1 rounded-full text-xs font-medium text-[#6E7180] mb-3">
                      질문 {nowQuestionNumber + 1} / {questions.length}
                    </div>
                  )}

                  <h3 className="text-xl font-semibold text-[#2A2C35]">
                    {type === "question"
                      ? `${questions[nowQuestionNumber].question}`
                      : `실전 모의 면접에서는 질문 미리보기가 제공되지 않습니다.`}
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
