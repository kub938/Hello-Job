import { Button } from "@/components/Button";

interface ReadCoverLetterProps {
  id: number;
  onClose: () => void;
}

function ReadCoverLetter({ onClose, id }: ReadCoverLetterProps) {
  return (
    <div className="h-[90vh] w-[940px] bg-white rounded-t-xl py-8 px-12 overflow-y-auto">
      <header className="flex w-full justify-between items-end mb-4">
        <h1 className="text-2xl font-bold">자기소개서 열람</h1>
      </header>

      <div className="mt-12 flex justify-center gap-4">
        <Button className="px-4 text-base" onClick={onClose} variant="white">
          창 닫기
        </Button>
      </div>
    </div>
  );
}

export default ReadCoverLetter;
