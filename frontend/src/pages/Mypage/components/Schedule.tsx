import { Button } from "@/components/Button";
import Calendar from "./Calendar";
import MypageHeader from "./MypageHeader";
import ScheduleCard from "./Schedule/ScheduleCard";
import ScheduleStepCard from "./Schedule/ScheduleStepCard";
import ScheduleModal from "./Schedule/ScheduleModal";
import { FaPlus } from "react-icons/fa";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useState } from "react";
import { ScheduleStatusStep, stepLabelMap } from "@/types/scheduleTypes";

const initialScheduleList = [
  {
    scheduleId: 1,
    scheduleTitle: "HELLO JOB 프로젝트",
    scheduleStartDate: "2025-04-29",
    scheduleEndDate: "2025-05-03",
    scheduleStatusName: "서류작성전",
    scheduleStatusStep: ScheduleStatusStep.PENDING,
    scheduleMemo: "지원 대기",
    coverLetterId: 1,
    coverLetterTitle: "HELLO JOB 프로젝트",
    updatedAt: "2025.05.10",
  },
  {
    scheduleId: 2,
    scheduleTitle: "테스트하려면",
    scheduleStartDate: "2025-05-04",
    scheduleEndDate: "2025-05-10",
    scheduleStatusName: "서류작성중",
    scheduleStatusStep: ScheduleStatusStep.PENDING,
    scheduleMemo: "",
    coverLetterId: 2,
    coverLetterTitle: "테스트하려면",
    updatedAt: "2025.05.10",
  },
  {
    scheduleId: 3,
    scheduleTitle: "이름을",
    scheduleStartDate: "2025-05-05",
    scheduleEndDate: "2025-05-07",
    scheduleStatusName: "진행중",
    scheduleStatusStep: ScheduleStatusStep.IN_PROGRESS,
    scheduleMemo: "",
    coverLetterId: 3,
    coverLetterTitle: "이름을",
    updatedAt: "2025.05.10",
  },
  {
    scheduleId: 4,
    scheduleTitle: "바꿔줘야",
    scheduleStartDate: "2025-05-08",
    scheduleEndDate: "2025-05-22",
    scheduleStatusName: "미제출",
    scheduleStatusStep: ScheduleStatusStep.PENDING,
    scheduleMemo: "할까 말까",
    coverLetterId: 4,
    coverLetterTitle: "바꿔줘야",
    updatedAt: "2025.05.10",
  },
  {
    scheduleId: 5,
    scheduleTitle: "하는 귀찮음이",
    scheduleStartDate: "2025-05-23",
    scheduleEndDate: "2025-05-25",
    scheduleStatusName: "서류작성중",
    scheduleStatusStep: ScheduleStatusStep.PENDING,
    scheduleMemo: "이거 되나",
    coverLetterId: 5,
    coverLetterTitle: "하는 귀찮음이",
    updatedAt: "2025.05.10",
  },
  {
    scheduleId: 6,
    scheduleTitle: "난 프론트가 싫어요",
    scheduleStartDate: "2025-05-20",
    scheduleEndDate: "2025-05-28",
    scheduleStatusName: "3차합격",
    scheduleStatusStep: ScheduleStatusStep.IN_PROGRESS,
    scheduleMemo: "메모에 뭐라고 써야 하냐",
    coverLetterId: 6,
    coverLetterTitle: "난 프론트가 싫어요",
    updatedAt: "2025.05.10",
  },
  {
    scheduleId: 7,
    scheduleTitle: "짱시룸",
    scheduleStartDate: "2025-05-29",
    scheduleEndDate: "2025-06-03",
    scheduleStatusName: "1차합격",
    scheduleStatusStep: ScheduleStatusStep.IN_PROGRESS,
    scheduleMemo: "결과 대기 중",
    coverLetterId: 7,
    coverLetterTitle: "짱시룸",
    updatedAt: "2025.05.10",
  },
  {
    scheduleId: 8,
    scheduleTitle: "HELLO JOB 프로젝트",
    scheduleStartDate: "2025-05-29",
    scheduleEndDate: "2025-05-31",
    scheduleStatusName: "최종합격",
    scheduleStatusStep: ScheduleStatusStep.DONE,
    scheduleMemo: "최합",
    coverLetterId: 8,
    coverLetterTitle: "HELLO JOB 프로젝트",
    updatedAt: "2025.05.10",
  },
];

interface Schedule {
  scheduleId: number;
  scheduleTitle: string;
  scheduleStartDate?: string;
  scheduleEndDate?: string;
  scheduleStatusName: string;
  scheduleStatusStep: string;
  scheduleMemo: string;
  coverLetterId?: number;
  coverLetterTitle?: string;
  updatedAt: string;
}

function Schedule() {
  const [scheduleList, setScheduleList] = useState(initialScheduleList);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<
    Schedule | undefined
  >(undefined);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const moveSchedule = (id: number, newStatusStep: ScheduleStatusStep) => {
    setScheduleList((prevList) =>
      prevList.map((schedule) =>
        schedule.scheduleId === id
          ? {
              ...schedule,
              scheduleStatusStep: newStatusStep,
              scheduleStatusName:
                newStatusStep === ScheduleStatusStep.PENDING
                  ? "서류작성중"
                  : newStatusStep === ScheduleStatusStep.IN_PROGRESS
                  ? "진행중"
                  : "전형종료",
            }
          : schedule
      )
    );
  };

  const handleAddSchedule = (scheduleData: {
    scheduleId?: number;
    title: string;
    startDate: string;
    endDate: string;
    status: string;
    statusStep: ScheduleStatusStep;
    memo: string;
    coverLetterId?: number;
    coverLetterTitle?: string;
  }) => {
    if (modalMode === "edit" && scheduleData.scheduleId) {
      setScheduleList((prev) =>
        prev.map((schedule) =>
          schedule.scheduleId === scheduleData.scheduleId
            ? {
                ...schedule,
                scheduleTitle: scheduleData.title,
                scheduleStartDate: scheduleData.startDate,
                scheduleEndDate: scheduleData.endDate,
                scheduleStatusName: scheduleData.status,
                scheduleStatusStep: scheduleData.statusStep,
                scheduleMemo: scheduleData.memo,
                coverLetterId: scheduleData.coverLetterId ?? 0,
                coverLetterTitle: scheduleData.coverLetterTitle ?? "",
                updatedAt: new Date()
                  .toISOString()
                  .split("T")[0]
                  .replace(/-/g, "."),
              }
            : schedule
        )
      );
    } else {
      const newSchedule = {
        scheduleId: scheduleList.length + 1,
        scheduleTitle: scheduleData.title,
        scheduleStartDate: scheduleData.startDate,
        scheduleEndDate: scheduleData.endDate,
        scheduleStatusName: scheduleData.status,
        scheduleStatusStep: scheduleData.statusStep,
        scheduleMemo: scheduleData.memo,
        coverLetterId: scheduleData.coverLetterId ?? 0,
        coverLetterTitle: scheduleData.coverLetterTitle ?? "",
        updatedAt: new Date().toISOString().split("T")[0].replace(/-/g, "."),
      };
      setScheduleList((prev) => [...prev, newSchedule]);
    }
  };

  const handleOpenModal = (schedule?: Schedule) => {
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
                  backgroundColor={stepValue.backgroundColor}
                  borderColor={stepValue.borderColor}
                  textColor={stepValue.textColor}
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

        <ScheduleModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleAddSchedule}
          initialData={selectedSchedule}
          mode={modalMode}
        />
      </div>
    </DndProvider>
  );
}

export default Schedule;
