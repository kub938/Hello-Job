import { useDrag } from "react-dnd";
import { useRef } from "react";
import { statusColorMap, statusBorderColorMap } from "@/types/scheduleTypes";
import { format, parseISO } from "date-fns";
import { getSchedulesResponse } from "@/types/scheduleApiTypes";

interface ScheduleCardProps {
  scheduleList: getSchedulesResponse[];
  onMoveSchedule: (id: number, newStatusStep: string) => void;
  onEdit: (schedule: any) => void;
}

interface ScheduleItemProps {
  schedule: getSchedulesResponse;
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
      className={`flex flex-row items-center justify-between relative pl-1 p-1 px-2 w-full border border-gray-200 ${borderColor} border-l-4 rounded-r-sm shadow-xs cursor-move hover:bg-gray-50 hover:shadow-sm ${
        isDragging ? "opacity-50" : ""
      }`}
      title={schedule.scheduleTitle}
      onClick={() => onEdit(schedule)}
    >
      <div className="px-2">
        <div className="text-sm font-semibold text-gray-900">
          {schedule.scheduleTitle.length > 16
            ? `${schedule.scheduleTitle.slice(0, 16)}...`
            : schedule.scheduleTitle}
        </div>
        <div className="flex flex-row gap-x-1">
          <div className="text-xs text-gray-500">
            {schedule.scheduleStartDate && schedule.scheduleEndDate
              ? `${formatDatetoDot(
                  schedule.scheduleStartDate
                )} - ${formatDatetoDot(schedule.scheduleEndDate)}`
              : "기간 미정"}
          </div>
        </div>
      </div>
      <div
        className={`flex h-6 items-center ${bgColor} rounded-xl px-2 py-1 text-xs`}
      >
        <span className="truncate max-w-[52px]">
          {schedule.scheduleStatusName}
        </span>
      </div>
    </li>
  );
};

function ScheduleCard({
  scheduleList,
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
            onMoveSchedule={onMoveSchedule}
            onEdit={onEdit}
          />
        ))}
      </ul>
    </div>
  );
}

export default ScheduleCard;
