interface ScheduleCardProps {
  scheduleList: {
    title: string;
    date: string;
    status: string;
    statusName: string;
    statusStep: string;
  }[];
  color: string;
  borderColor: string;
  textColor: string;
}

function ScheduleCard({
  scheduleList,
  color,
  borderColor,
  textColor,
}: ScheduleCardProps) {
  return (
    <div className="w-full">
      <ul className="flex flex-col items-center py-2 gap-y-1">
        {scheduleList.map((schedule) => (
          <li className="flex flex-row items-center justify-between relative pl-1 p-1 w-full">
            <div className="flex flex-row items-center">
              <div
                className={`h-8 p-1 flex items-center border-l-2 ${borderColor} pl-2`}
              />
              <div className="pr-4">
                <div className="text-sm font-semibold text-gray-900">
                  {schedule.title}
                </div>
                <div className="flex flex-row gap-x-1">
                  <div className="text-xs text-gray-500">{schedule.date}</div>
                  <div className="text-xs text-gray-500">
                    <div className="text-xs text-gray-500">
                      {schedule.status}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`flex h-6 items-center ${color} rounded-xl px-2 py-1 text-xs ${textColor}`}
            >
              {schedule.statusName}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ScheduleCard;
