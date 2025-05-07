import { Button } from "@/components/Button";

interface CreateJobProps {
  onClose: () => void;
}

function CreateJob({ onClose }: CreateJobProps) {
  return (
    <div className="h-[90vh] w-[940px] bg-white rounded-t-xl py-8 px-12 overflow-y-auto">
      <div>직무 생성</div>
      <div className="mt-8 text-end">
        <Button className="px-6" onClick={onClose}>
          창 닫기
        </Button>
      </div>
    </div>
  );
}

export default CreateJob;
