import { useDrag } from "react-dnd";
import { useRef } from "react";
import { statusColorMap, statusBorderColorMap } from "@/types/scheduleTypes";
import { format, parseISO } from "date-fns";

interface ScheduleCardProps {
  scheduleList: {
    scheduleId: number;
    scheduleTitle: string;
    scheduleStartDate: string;
    scheduleEndDate: string;
    scheduleStatusName: string;
    scheduleStatusStep: string;
    scheduleMemo: string;
    coverLetterId?: number;
    coverLetterTitle?: string;
    updatedAt: string;
  }[];
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  onMoveSchedule: (id: number, newStatusStep: string) => void;
  onEdit: (schedule: any) => void;
}

interface ScheduleItemProps {
  schedule: {
    scheduleId: number;
    scheduleTitle: string;
    scheduleStartDate: string;
    scheduleEndDate: string;
    scheduleStatusName: string;
    scheduleStatusStep: string;
    scheduleMemo: string;
    coverLetterId?: number;
    coverLetterTitle?: string;
    updatedAt: string;
  };
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  onMoveSchedule: (id: number, newStatusStep: string) => void;
  onEdit: (schedule: any) => void;
}

const ScheduleItem = ({ schedule, onEdit }: ScheduleItemProps) => {
  const ref = useRef<HTMLLIElement>(null);
  const formatDatetoDot = (date: string) => {
    try {
      return format(parseISO(date), "yyyy.MM.dd");
    } catch (error) {
      return date;
    }
  };
  const bgColor = statusColorMap[schedule.scheduleStatusName] ?? "bg-gray-300";
  const borderColor =
    statusBorderColorMap[schedule.scheduleStatusName] ?? "border-l-gray-300";

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "SCHEDULE",
    item: {
      scheduleId: schedule.scheduleId,
      scheduleStatusStep: schedule.scheduleStatusStep,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  drag(ref);

  return (
    <li
      ref={ref}
      className={`flex flex-row items-center justify-between relative pl-1 p-1 px-2 w-full border border-gray-200 ${borderColor} border-l-4 rounded-r-sm shadow-xs cursor-move ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="px-2">
        <div className="text-sm font-semibold text-gray-900">
          {schedule.scheduleTitle}
        </div>
        <div className="flex flex-row gap-x-1">
          <div className="text-xs text-gray-500">
            {formatDatetoDot(schedule.scheduleStartDate)} -{" "}
            {formatDatetoDot(schedule.scheduleEndDate)}
          </div>
        </div>
      </div>
      <button
        onClick={() => onEdit(schedule)}
        className={`flex h-6 items-center ${bgColor} rounded-xl px-2 py-1 text-xs cursor-pointer`}
      >
        {schedule.scheduleStatusName}
      </button>
    </li>
  );
};

function ScheduleCard({
  scheduleList,
  backgroundColor,
  borderColor,
  textColor,
  onMoveSchedule,
  onEdit,
}: ScheduleCardProps) {
  return (
    <div className="w-full">
      <ul className="flex flex-col items-center py-1 gap-y-2">
        {scheduleList.map((schedule) => (
          <ScheduleItem
            key={schedule.scheduleId}
            schedule={schedule}
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            textColor={textColor}
            onMoveSchedule={onMoveSchedule}
            onEdit={onEdit}
          />
        ))}
      </ul>
    </div>
  );
}

export default ScheduleCard;
