interface ScheduleStepCardProps {
  statusStep: string;
  children?: React.ReactNode;
}

function ScheduleStepCard({ statusStep, children }: ScheduleStepCardProps) {
  return (
    <div className="min-w-[240px] border border-gray-200 rounded-lg p-4 bg-white flex flex-col">
      <div className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-1">
        {statusStep}
      </div>
      <div className="flex">{children}</div>
    </div>
  );
}

export default ScheduleStepCard;
