import { authApi } from "@/api/instance";

export const sseAckHandler = async (eventName: string, data: any) => {
  try {
    await authApi.post("/sse/ack", {
      eventName,
      data: data,
    });
  } catch (error) {
    console.warn("ACK 전송 실패:", error);
  }
};
