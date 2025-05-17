import { ChevronRight, X } from "lucide-react";
import CoverLetterSelectionPanel from "./CoverLetterSelectionPanel";
import { Button } from "@/components/Button";
import { useState } from "react";
import { useNavigate } from "react-router";

interface CategorySelectModalLayoutProps {
  onClose: () => void;
}

function CategorySelectModalLayout({
  onClose,
}: CategorySelectModalLayoutProps) {
  const [selectedCoverLetterId, setSelectedCoverLetterId] = useState<
    number | null
  >(null);
  const navigate = useNavigate();
  const handleSelectCoverLetter = (id: number) => {
    if (selectedCoverLetterId === id) {
      return;
    }
    setSelectedCoverLetterId(id);
  };

  const onNext = () => {
    navigate("/interview/prepare");
  };
  return (
    <>
      <div className="modal-overlay z-150">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
          {/* 헤더 */}
          <div className="border-b border-border px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-secondary-foreground">
              자기소개서 선택
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-secondary-foreground transition-colors rounded-full p-1 hover:bg-secondary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 컨텐츠 */}
          <div className="p-6 ">
            <p className="text-muted-foreground mb-4">
              면접에 사용할 자기소개서를 선택해 주세요!
            </p>

            <div className=" overflow-hidden">
              <CoverLetterSelectionPanel
                selectedCoverLetterId={selectedCoverLetterId}
                onSelectCoverLetter={handleSelectCoverLetter}
              />
            </div>
          </div>

          {/* 푸터 */}
          <div className=" p-4 flex justify-end items-center gap-3 border-t border-border">
            <Button variant="white" onClick={onClose} className="px-4 py-2">
              취소
            </Button>
            <Button
              onClick={onNext}
              className="px-6 py-2 flex items-center gap-2"
              disabled={!selectedCoverLetterId}
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CategorySelectModalLayout;
