import { scheduleApi } from "@/api/scheduleApi";
import {
  postScheduleRequest,
  getScheduleResponse,
  getSchedulesResponse,
  getScheduleCoverLettersResponse,
} from "@/types/scheduleApiTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// 특정 schedule을 가져오는 쿼리 훅
export const useGetSchedule = (scheduleId: number | undefined) => {
  return useQuery<getScheduleResponse>({
    queryKey: ["schedule", scheduleId],
    queryFn: async () => {
      if (scheduleId === undefined) {
        throw new Error("Schedule Id is undefined");
      }
      const response = await scheduleApi.getSchedule(scheduleId);
      return response.data;
    },
    // scheduleId가 유효한 값인 경우에만 쿼리 실행
    enabled: scheduleId !== undefined,
  });
};

// 모든 schedule을 가져오는 쿼리 훅
export const useGetSchedules = () => {
  return useQuery<getSchedulesResponse[]>({
    queryKey: ["schedules"],
    queryFn: async () => {
      const response = await scheduleApi.getSchedules();
      console.log(response.data);
      return response.data;
    },
  });
};

// 일정 등록 훅
export const useCreateSchedule = () => {
  return useMutation({
    mutationKey: ["create-schedule"],
    mutationFn: async (inputData: postScheduleRequest) => {
      const response = await scheduleApi.postSchedule(inputData);
      return response.data;
    },
  });
};

// 일정 수정(전체 내용) 훅
export const useUpdateSchedule = () => {
  return useMutation({
    mutationKey: ["update-schedule"],
    mutationFn: async ({
      scheduleId,
      inputData,
    }: {
      scheduleId: number;
      inputData: postScheduleRequest;
    }) => {
      if (scheduleId === undefined) {
        throw new Error("Schedule Id is undefined");
      }
      const response = await scheduleApi.putSchedule(inputData, scheduleId);
      return response.data;
    },
  });
};

// 일정 상태 수정 훅
export const useUpdateScheduleStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-schedule-status"],
    mutationFn: async ({
      scheduleId,
      scheduleStatusName,
    }: {
      scheduleId: number;
      scheduleStatusName: string;
    }) => {
      if (scheduleId === undefined) {
        throw new Error("Schedule Id is undefined");
      }
      console.log(
        "일정 상태 변경 id: ",
        scheduleId,
        "status: ",
        scheduleStatusName
      );
      const response = await scheduleApi.patchScheduleStatus(
        scheduleId,
        scheduleStatusName
      );
      console.log(response.data);
      return response.data;
    },

    onMutate: async ({ scheduleId, scheduleStatusName }) => {
      await queryClient.cancelQueries({
        queryKey: ["schedules"],
      });
      const previousSchedules = queryClient.getQueryData<
        getSchedulesResponse[]
      >(["schedules"]);

      // 업데이트값 계산
      const updatedSchedule = previousSchedules?.map((schedule) =>
        schedule.scheduleId === scheduleId
          ? {
              ...schedule,
              scheduleStatusStep:
                scheduleStatusName === "미제출"
                  ? "PENDING"
                  : scheduleStatusName === "진행중"
                  ? "IN_PROGRESS"
                  : "DONE",
              scheduleStatusName: scheduleStatusName,
            }
          : schedule
      );

      queryClient.setQueryData(["schedules"], updatedSchedule);
      return { previousSchedules };
    },

    onError: (error, variables, context) => {
      console.log(error.message);
      toast.error("일정 상태 수정에 실패했습니다.");
      if (context?.previousSchedules) {
        queryClient.setQueryData(["schedules"], context.previousSchedules);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["schedules"],
      });
    },
  });
};

// 일정 삭제 훅
export const useDeleteSchedule = () => {
  return useMutation({
    mutationKey: ["delete-schedule"],
    mutationFn: async (scheduleId: number) => {
      if (scheduleId === undefined) {
        throw new Error("Schedule Id is undefined");
      }
      const response = await scheduleApi.deleteSchedule(scheduleId);
      return response.status;
    },
  });
};

// 자기소개서 목록 조회
export const useGetScheduleCoverLetters = () => {
  return useQuery<getScheduleCoverLettersResponse[]>({
    queryKey: ["schedule-cover-letters"],
    queryFn: async () => {
      const response = await scheduleApi.getScheduleCoverLetters();
      console.log("자기소개서 목록: ", response.data);
      return response.data;
    },
  });
};
