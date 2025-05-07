import { Button } from "@/components/Button";

interface CreateCorporateProps {
  onClose: () => void;
}

function CreateCorporate({ onClose }: CreateCorporateProps) {
  return (
    <div className="h-[90vh] w-[940px] bg-white rounded-t-xl py-8 px-12 overflow-y-auto">
      <div className="mt-8 text-end">
        <Button className="px-6" onClick={onClose}>
          창 닫기
        </Button>
      </div>
    </div>
  );
}

export default CreateCorporate;
