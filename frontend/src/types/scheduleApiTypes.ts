import { ScheduleStatusStep } from "./scheduleTypes";

export interface postScheduleRequest {
  scheduleTitle: string;
  scheduleMemo: string;
  scheduleStartDate: string;
  scheduleEndDate: string;
  scheduleStatusName: string;
  coverLetterId: number;
}

export interface postScheduleResponse {
  scheduleId: number;
}

export interface getScheduleResponse {
  scheduleId: number;
  scheduleTitle: string;
  scheduleMemo: string;
  scheduleStartDate: string;
  scheduleEndDate: string;
  scheduleStatusName: string;
  scheduleStatusStep: ScheduleStatusStep;
  coverLetterId: number;
  coverLetterTitle: string;
  updatedAt: string;
}

export interface getSchedulesResponse {
  scheduleId: number;
  scheduleTitle: string;
  scheduleMemo: string;
  scheduleStartDate: string;
  scheduleEndDate: string;
  scheduleStatusName: string;
  coverLetterId: number;
}
