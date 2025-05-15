import { authApi } from "./instance";
import {
  postScheduleRequest,
  postScheduleResponse,
  getScheduleResponse,
  getSchedulesResponse,
} from "@/types/scheduleApiTypes";

export const scheduleApi = {
  postSchedule: (scheduleFormData: postScheduleRequest) => {
    return authApi.post<postScheduleResponse>(
      "/api/v1/schedule",
      scheduleFormData
    );
  },
  getSchedule: (scheduleId: number) => {
    return authApi.get<getScheduleResponse>(`/api/v1/schedule/${scheduleId}`);
  },
  getSchedules: () => {
    return authApi.get<getSchedulesResponse[]>(`/api/v1/schedule`);
  },
  putSchedule: (scheduleFormData: postScheduleRequest, scheduleId: number) => {
    return authApi.put<postScheduleResponse>(
      `/api/v1/schedule/${scheduleId}`,
      scheduleFormData
    );
  },
  deleteSchedule: (scheduleId: number) => {
    return authApi.delete(`/api/v1/schedule/${scheduleId}`);
  },
  patchScheduleStatus: (scheduleId: number, scheduleStatusName: string) => {
    return authApi.patch(`/api/v1/schedule/${scheduleId}/status`, {
      scheduleStatusName,
    });
  },
};
