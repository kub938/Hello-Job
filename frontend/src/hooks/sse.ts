import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { sseAckHandler } from "@/utils/sseAckHandler";
import { useQueryClient } from "@tanstack/react-query";

export default function useSSE(isLoggedIn: boolean) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("📡 useSSE 실행됨 - 탭 ID:", performance.now());
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    let eventSource: EventSource | null = null;
    let lastPing = Date.now();

    const connect = () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }

      eventSource = new EventSource("https://k12b105.p.ssafy.io/sse/subscribe");
      console.log("SSE 연결됨");

      // 핑 이벤트 수신
      eventSource.addEventListener("ping", (_e: MessageEvent) => {
        lastPing = Date.now();
        // console.debug("📨 핑 이벤트:", e.data);
      });

      // 기업 분석 완료 이벤트 수신
      eventSource.addEventListener(
        "company-analysis-completed",
        async (e: MessageEvent) => {
          const data = JSON.parse(e.data);
          const { companyId, companyAnalysisId } = data;
          queryClient.invalidateQueries({
            queryKey: ["corporateReportList", String(companyId)],
          });
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
          await sseAckHandler("company-analysis-completed", data);
        }
      );

      // 기업 분석 실패 이벤트 수신
      eventSource.addEventListener(
        "company-analysis-failed",
        async (e: MessageEvent) => {
          const data = JSON.parse(e.data);
          const { companyId } = data;
          toast("기업 분석이 실패했습니다!", {
            description: "잠시 후 다시 시도해주세요",
            action: {
              label: "다시 시도",
              onClick: () => navigate(`/corporate-research/${companyId}`),
            },
          });
          await sseAckHandler("company-analysis-failed", data);
        }
      );

      // 인터뷰 결과 분석 완료 이벤트 수신
      eventSource.addEventListener(
        "interview-feedback-completed",
        async (e: MessageEvent) => {
          const data = JSON.parse(e.data);
          queryClient.invalidateQueries({ queryKey: ["interviewResultList"] });

          toast("인터뷰 결과 분석이 완료되었습니다!", {
            description: "결과를 확인하려면 클릭하세요",
            action: {
              label: "보러가기",
              onClick: () => navigate(`/mypage/interviews-videos`),
            },
          });
          await sseAckHandler("interview-feedback-completed", data);
        }
      );

      // 인터뷰 결과 분석 실패 이벤트 수신
      eventSource.addEventListener(
        "interview-feedback-failed",
        async (e: MessageEvent) => {
          const data = JSON.parse(e.data);
          queryClient.invalidateQueries({ queryKey: ["interviewResultList"] });

          toast("인터뷰 결과 분석이 실패했습니다!", {
            description: "잠시 후 다시 시도해주세요",
            action: {
              label: "다시 시도",
              onClick: () => navigate(`/mypage/interviews-videos`),
            },
          });
          await sseAckHandler("interview-feedback-failed", data);
        }
      );

      eventSource.onerror = (_err) => {
        // console.error("SSE 오류:", _err);
      };
    };

    connect();

    // 마지막 ping이 30초 이상 지났으면 재연결 <- 10초마다 체크
    const reconnectTimer = setInterval(() => {
      if (Date.now() - lastPing > 30000) {
        connect();
      }
    }, 10000);

    return () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      clearInterval(reconnectTimer);
    };
  }, [isLoggedIn]);
}
