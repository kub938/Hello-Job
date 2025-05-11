import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

const baseURL = import.meta.env.DEV ? "" : "http://localhost:8080";

export default function useSSE(userId: number) {
  const navigate = useNavigate();
  useEffect(() => {
    const eventSource = new EventSource(
      `${baseURL}/api/v1/users/${userId}/sse/subscribe`
    );

    // event 이름이 없는 일반 메시지
    eventSource.onmessage = (e: MessageEvent) => {
      console.log("📨 일반 메시지:", e.data);
    };

    // 커스텀 이벤트 수신
    eventSource.addEventListener(
      "company-analysis-completed",
      (e: MessageEvent) => {
        const companyAnalysisId = JSON.parse(e.data);
          toast.success("기업 분석이 완료되었습니다.");
      }
    );

    eventSource.onerror = (err) => {
      console.error("SSE 오류:", err);
    };

    return () => {
      eventSource.close();
    };
  }, [userId]);
}
