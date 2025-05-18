import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export default function useSSE(isLoggedIn: boolean) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) return;

    const eventSource = new EventSource(
      "https://k12b105.p.ssafy.io/sse/subscribe"
    );

    // 핑 이벤트 수신
    eventSource.addEventListener("ping", (_e: MessageEvent) => {
      // console.debug("📨 핑 이벤트:", e.data);
    });

    // 기업 분석 완료 이벤트 수신
    eventSource.addEventListener(
      "company-analysis-completed",
      (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        // console.log("기업 분석 완료 이벤트:", data);
        const { companyId, companyAnalysisId } = data;
        toast("기업 분석이 완료되었습니다!", {
          description: "결과를 확인하려면 클릭하세요",
          action: {
            label: "보러가기",
            onClick: () =>
              navigate(
                `/corporate-research/${companyId}?openId=${companyAnalysisId}`
              ),
          },
        });
      }
    );

    // 기업 분석 실패 이벤트 수신
    eventSource.addEventListener(
      "company-analysis-failed",
      (e: MessageEvent) => {
        const companyId = JSON.parse(e.data);
        // console.log("기업 분석 실패 이벤트:", companyId);
        toast("기업 분석이 실패했습니다!", {
          description: "잠시 후 다시 시도해주세요",
          action: {
            label: "다시 시도",
            onClick: () => navigate(`/corporate-research/${companyId}`),
          },
        });
      }
    );

    eventSource.onerror = (err) => {
      console.error("SSE 오류:", err);
    };

    return () => {
      eventSource.close();
    };
  }, [isLoggedIn]);
}
