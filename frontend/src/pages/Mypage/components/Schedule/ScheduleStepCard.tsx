import { useDrop } from "react-dnd";
import { useRef } from "react";
import { ScheduleStatusStep } from "@/types/scheduleTypes";
interface ScheduleStepCardProps {
  statusStep: string;
  children?: React.ReactNode;
  onMoveSchedule: (id: number, newStatusStep: ScheduleStatusStep) => void;
  stepKey: string;
}

function ScheduleStepCard({
  statusStep,
  children,
  onMoveSchedule,
  stepKey,
}: ScheduleStepCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "SCHEDULE",
    drop: (item: { scheduleId: number; scheduleStatusStep: string }) => {
      if (item.scheduleStatusStep !== stepKey) {
        onMoveSchedule(item.scheduleId, stepKey as ScheduleStatusStep);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  drop(ref);

  return (
    <div
      ref={ref}
      className={`min-w-[240px] border border-gray-200 rounded-lg p-4 bg-white flex flex-col ${
        isOver ? "bg-gray-50" : ""
      }`}
    >
      <div className="text-lg font-semibold text-gray-800 pb-1 mb-1">
        {statusStep}
      </div>
      <div className="flex flex-col h-[220px] overflow-y-auto">{children}</div>
    </div>
  );
}

export default ScheduleStepCard;
