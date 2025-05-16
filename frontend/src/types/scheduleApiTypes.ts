import { ScheduleStatusStep } from "./scheduleTypes";

export interface postScheduleRequest {
  scheduleTitle: string;
  scheduleMemo: string | null;
  scheduleStartDate: string | null;
  scheduleEndDate: string | null;
  scheduleStatusName: string;
  coverLetterId: number | null;
}

export interface postScheduleResponse {
  scheduleId: number;
}

export interface getScheduleResponse {
  scheduleId: number | null;
  scheduleTitle: string;
  scheduleMemo: string | null;
  scheduleStartDate: string | null;
  scheduleEndDate: string | null;
  scheduleStatusName: string;
  scheduleStatusStep: ScheduleStatusStep;
  coverLetterId: number | null;
}

export interface getSchedulesResponse {
  scheduleId: number | null;
  scheduleTitle: string;
  scheduleMemo: string | null;
  scheduleStartDate: string | null;
  scheduleEndDate: string | null;
  scheduleStatusName: string;
  scheduleStatusStep: ScheduleStatusStep;
  coverLetterId: number | null;
}
