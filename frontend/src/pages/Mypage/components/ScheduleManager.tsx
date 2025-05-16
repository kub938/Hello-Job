import { Button } from "@/components/Button";
import Calendar from "./Schedule/Calendar";
import MypageHeader from "./MypageHeader";
import ScheduleCard from "./Schedule/ScheduleCard";
import ScheduleStepCard from "./Schedule/ScheduleStepCard";
import ScheduleModal from "./Schedule/ScheduleModal";
import { FaPlus } from "react-icons/fa";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useEffect, useState } from "react";
import { ScheduleStatusStep, stepLabelMap } from "@/types/scheduleTypes";
import {
  useCreateSchedule,
  useDeleteSchedule,
  useGetSchedules,
  useUpdateSchedule,
  useUpdateScheduleStatus,
} from "@/hooks/scheduleHooks";
import Loading from "@/components/Loading/Loading";
import { useQueryClient } from "@tanstack/react-query";
import { getSchedulesResponse } from "@/types/scheduleApiTypes";
import { toast } from "sonner";
import axios from "axios";

function ScheduleManager() {
  const queryClient = useQueryClient();
  const [selectedSchedule, setSelectedSchedule] = useState<
    getSchedulesResponse | undefined
  >(undefined);
  const { data: schedulesList, isLoading } = useGetSchedules();
  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const updateStatusMutation = useUpdateScheduleStatus();
  const deleteMutation = useDeleteSchedule();
  const [scheduleList, setScheduleList] = useState<
    getSchedulesResponse[] | undefined
  >();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  useEffect(() => {
    setScheduleList(schedulesList);
  }, [schedulesList]);

  const moveSchedule = (id: number, newStatusStep: ScheduleStatusStep) => {
    const statusName =
      newStatusStep === ScheduleStatusStep.PENDING
        ? "미제출"
        : newStatusStep === ScheduleStatusStep.IN_PROGRESS
        ? "진행중"
        : "전형종료";

    updateStatusMutation.mutate({
      scheduleId: id,
      scheduleStatusName: statusName,
    });
  };

  const handleAddSchedule = (scheduleData: getSchedulesResponse) => {
    const payload = {
      scheduleTitle: scheduleData.scheduleTitle,
      scheduleStartDate: scheduleData.scheduleStartDate || null,
      scheduleEndDate: scheduleData.scheduleEndDate || null,
      scheduleStatusName: scheduleData.scheduleStatusName,
      scheduleMemo: scheduleData.scheduleMemo,
      coverLetterId: scheduleData.coverLetterId || null,
    };
    if (modalMode === "edit" && scheduleData.scheduleId) {
      updateMutation.mutate(
        { inputData: payload, scheduleId: scheduleData.scheduleId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["schedules"] });
            handleCloseModal();
            toast.success("일정 수정이 완료되었습니다.");
          },
          onError: (error) => {
            if (axios.isAxiosError(error)) {
              console.error("❌ Axios Error:", error.response?.data);
            } else {
              console.error("❌ Unknown Error:", error);
            }
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["schedules"] });
          handleCloseModal();
          toast.success("일정 등록이 완료되었습니다.");
        },
        onError: () => {
          toast.error("일정 등록에 실패했습니다.");
        },
      });
    }
  };

  const handleOpenModal = (schedule?: getSchedulesResponse) => {
    if (schedule) {
      setSelectedSchedule(schedule);
      setModalMode("edit");
    } else {
      setSelectedSchedule(undefined);
      setModalMode("create");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSchedule(undefined);
    setModalMode("create");
  };

  const handleDeleteSchedule = (scheduleId: number) => {
    deleteMutation.mutate(scheduleId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["schedules"] });
        toast.success("일정 삭제가 완료되었습니다.");
      },
      onError: () => {
        toast.error("일정 삭제에 실패했습니다.");
      },
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full p-4 md:p-6 md:ml-56 transition-all duration-300">
        <div className="flex flex-row justify-between items-center">
          <MypageHeader title="일정 관리" />
          <Button variant="default" onClick={() => handleOpenModal()}>
            <div className="flex items-center">
              <FaPlus className="mr-2" /> 일정 등록
            </div>
          </Button>
        </div>

        {isLoading ? (
          <div className="mt-10">
            <p className="text-center text-gray-600 mb-4">
              일정 목록을 불러오고 있습니다...
            </p>
            <Loading className="h-40" />
          </div>
        ) : !scheduleList || scheduleList.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            등록된 일정이 없습니다
          </p>
        ) : (
          <>
            <div className="flex flex-row gap-6 overflow-x-auto">
              {Object.entries(stepLabelMap).map(([stepKey, stepValue]) => (
                <div key={stepKey} className="w-1/3">
                  <ScheduleStepCard
                    statusStep={stepValue.label}
                    stepKey={stepKey}
                    onMoveSchedule={moveSchedule}
                  >
                    <ScheduleCard
                      scheduleList={scheduleList.filter(
                        (item) => item.scheduleStatusStep === stepKey
                      )}
                      onMoveSchedule={(id, newStatusStep) =>
                        moveSchedule(id, newStatusStep as ScheduleStatusStep)
                      }
                      onEdit={handleOpenModal}
                    />
                  </ScheduleStepCard>
                </div>
              ))}
            </div>
            <Calendar scheduleList={scheduleList} />
          </>
        )}

        <ScheduleModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleAddSchedule}
          data={selectedSchedule}
          mode={modalMode}
          onDelete={() =>
            selectedSchedule?.scheduleId &&
            handleDeleteSchedule(selectedSchedule.scheduleId)
          }
        />
      </div>
    </DndProvider>
  );
}

export default ScheduleManager;
