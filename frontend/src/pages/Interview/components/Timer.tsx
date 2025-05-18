import { useEffect, useState } from "react";

interface TimerProps {
  isComplete: boolean;
  time: number;
  prepareState: boolean;
  onAnswerCompleted: () => void;
}
function Timer({
  isComplete,
  time,
  prepareState,
  onAnswerCompleted,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(time); // 2분

  useEffect(() => {
    if (!prepareState) return;
    if (timeLeft <= 0) {
      onAnswerCompleted();
      return;
    }
    if (isComplete) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, prepareState]);

  useEffect(() => {
    setTimeLeft(time);
  }, [prepareState, isComplete]);
  return (
    <>
      <div className="w-full h-full flex items-center justify-center">
        <svg className="w-48 h-48" viewBox="0 0 100 100">
          {/* 배경 원 */}
          <circle cx="50" cy="50" r="45" fill="#F1F3F9" />

          {/* 진행 원 */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#886BFB"
            strokeWidth="5"
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={2 * Math.PI * 45 * (1 - timeLeft / time)}
            transform="rotate(-90 50 50)"
            className="transition-all duration-1000 ease-linear"
          />

          {/* 시간 텍스트 */}
          <text
            x="50"
            y="45"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xl font-bold"
            fill="#2A2C35"
          >
            {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </text>

          <text
            x="50"
            y="65"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[10px]"
            fill="#6E7180"
          >
            남은 시간
          </text>
        </svg>
      </div>
    </>
  );
}

export default Timer;
