import { useEffect, useRef, useState } from "react";
import FormInput from "@/components/Common/FormInput";
import Select from "@/components/Common/Select";
import { Button } from "@/components/Button";
import {
  ScheduleStatus,
  ScheduleStatusStep,
  scheduleStatusList,
} from "@/types/scheduleTypes";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scheduleData: {
    scheduleId?: number;
    title: string;
    startDate: string;
    endDate: string;
    status: string;
    statusStep: ScheduleStatusStep;
    memo: string;
    coverLetterId?: number;
    coverLetterTitle?: string;
  }) => void;
  initialData?: {
    scheduleId: number;
    scheduleTitle: string;
    scheduleStartDate?: string;
    scheduleEndDate?: string;
    scheduleStatusName: string;
    scheduleStatusStep: string;
    scheduleMemo: string;
    coverLetterId?: number;
    coverLetterTitle?: string;
  };
  mode?: "create" | "edit";
}

function ScheduleModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "create",
}: ScheduleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedStep, setSelectedStep] = useState<ScheduleStatusStep>(
    ScheduleStatusStep.PENDING
  );
  const [selectedStatus, setSelectedStatus] = useState<ScheduleStatus>(
    scheduleStatusList[ScheduleStatusStep.PENDING][0]
  );
  const [selectedCoverLetterId, setSelectedCoverLetterId] = useState<number>(0);
  const [selectedCoverLetterTitle, setSelectedCoverLetterTitle] =
    useState<string>("");

  const resetForm = () => {
    setTitle("");
    setStartDate("");
    setEndDate("");
    setMemo("");
    setSelectedStep(ScheduleStatusStep.PENDING);
    setSelectedStatus(scheduleStatusList[ScheduleStatusStep.PENDING][0]);
    setSelectedCoverLetterId(0);
    setSelectedCoverLetterTitle("");
  };

  const typeOptions = [
    { value: "공채", label: "공채" },
    { value: "수시채용", label: "수시채용" },
    { value: "인턴", label: "인턴" },
    { value: "기타", label: "기타" },
  ];

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.scheduleTitle);
      setStartDate(initialData.scheduleStartDate || "");
      setEndDate(initialData.scheduleEndDate || "");
      setMemo(initialData.scheduleMemo);
      setSelectedStep(initialData.scheduleStatusStep as ScheduleStatusStep);
      const status = scheduleStatusList[
        initialData.scheduleStatusStep as ScheduleStatusStep
      ].find((s) => s.name === initialData.scheduleStatusName);
      if (status) {
        setSelectedStatus(status);
      }
      if (initialData.coverLetterId) {
        setSelectedCoverLetterId(initialData.coverLetterId);
      }
      if (initialData.coverLetterTitle) {
        setSelectedCoverLetterTitle(initialData.coverLetterTitle);
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (isOpen && mode === "create") {
      resetForm();
    }
  }, [isOpen, mode]);

  // ESC 키를 누를 때 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 모달 외부 클릭 시 닫기
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...(initialData?.scheduleId && { scheduleId: initialData.scheduleId }),
      title: title,
      startDate: startDate,
      endDate: endDate,
      status: selectedStatus.name,
      statusStep: selectedStatus.step,
      memo: memo,
      coverLetterId: selectedCoverLetterId,
      coverLetterTitle: selectedCoverLetterTitle,
    });
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg w-[36rem] max-w-[90vw] max-h-[80vh] overflow-auto"
      >
        <form onSubmit={handleSubmit} className="flex flex-col p-6">
          <h2 className="text-2xl font-bold mb-5">일정 등록</h2>
          <div className="space-y-3">
            {/* 일정 정보 */}
            <FormInput
              type="text"
              name="title"
              label="일정 제목"
              require
              placeholder="일정 제목을 입력해주세요"
              value={title}
              width="100%"
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="space-y-2 pt-3">
              {/* 일정 진행 단계 */}
              <label className="text-foreground text-sm font-semibold block">
                진행 상태 <span className="text-destructive">*</span>
              </label>
              <div className="border-y border-gray-200 rounded-md p-2">
                <div className="flex border-b border-gray-200">
                  {Object.values(ScheduleStatusStep).map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => {
                        setSelectedStep(step);
                        setSelectedStatus(scheduleStatusList[step][0]);
                      }}
                      className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                        selectedStep === step
                          ? "border-primary text-primary"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {step === ScheduleStatusStep.PENDING
                        ? "준비 중"
                        : step === ScheduleStatusStep.IN_PROGRESS
                        ? "진행 중"
                        : "완료"}
                    </button>
                  ))}
                </div>
                {/* 일정 진행 상태 */}
                <div className="mt-4">
                  <div className="grid grid-cols-4 gap-2">
                    {scheduleStatusList[selectedStep].map((status) => (
                      <button
                        key={status.name}
                        type="button"
                        onClick={() => setSelectedStatus(status)}
                        className={`p-2 rounded-md text-sm transition-colors cursor-pointer ${
                          selectedStatus.name === status.name
                            ? "bg-primary text-white shadow-sm"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {status.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                type="date"
                name="startDate"
                label="시작 날짜"
                value={startDate}
                width="100%"
                onChange={(e) => setStartDate(e.target.value)}
              />
              <FormInput
                type="date"
                name="endDate"
                label="종료 날짜"
                value={endDate}
                width="100%"
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <Select
              label="자기소개서"
              options={typeOptions}
              value={selectedCoverLetterId}
              onChange={setSelectedCoverLetterId}
              width="100%"
            />
            <FormInput
              type="text"
              name="memo"
              label="메모"
              placeholder="메모를 입력해주세요"
              value={memo}
              width="100%"
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          <div className="flex justify-center gap-3 mt-6">
            {mode === "edit" ? (
              <Button
                type="button"
                variant="white"
                className="w-24"
                onClick={onClose}
              >
                삭제
              </Button>
            ) : null}
            <Button type="submit" className="w-24">
              {mode === "create" ? "등록" : "수정"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="white"
              className="w-24"
            >
              취소
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ScheduleModal;
