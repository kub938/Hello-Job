import { useEffect, useRef, useState } from "react";
import FormInput from "@/components/Common/FormInput";
import Select from "@/components/Common/Select";
import { Button } from "@/components/Button";
import {
  ScheduleStatus,
  ScheduleStatusStep,
  scheduleStatusList,
} from "@/types/scheduleTypes";
import {
  getScheduleCoverLettersResponse,
  getSchedulesResponse,
} from "@/types/scheduleApiTypes";
import { toast } from "sonner";
import { useGetScheduleCoverLetters } from "@/hooks/scheduleHooks";
import Modal from "@/components/Modal";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scheduleData: getSchedulesResponse) => void;
  data?: getSchedulesResponse;
  mode?: "create" | "edit";
  onDelete: (scheduleId: number) => void;
}

function ScheduleModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  data,
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
  const [selectedCoverLetterId, setSelectedCoverLetterId] = useState<
    number | "none" | null
  >(null);

  const resetForm = () => {
    setTitle("");
    setStartDate("");
    setEndDate("");
    setMemo("");
    setSelectedStep(ScheduleStatusStep.PENDING);
    setSelectedStatus(scheduleStatusList[ScheduleStatusStep.PENDING][0]);
    setSelectedCoverLetterId(null);
  };

  const { data: coverLetters } = useGetScheduleCoverLetters();
  const [coverLetterList, setCoverLetterList] = useState<
    getScheduleCoverLettersResponse[] | undefined
  >();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setCoverLetterList(coverLetters);
  }, [coverLetters]);

  useEffect(() => {
    if (isOpen && mode === "create") {
      resetForm();
    } else if (isOpen && mode === "edit" && data) {
      setTitle(data.scheduleTitle);
      setStartDate(data.scheduleStartDate || "");
      setEndDate(data.scheduleEndDate || "");
      setMemo(data.scheduleMemo ?? "");
      setSelectedStep(data.scheduleStatusStep as ScheduleStatusStep);
      const status = scheduleStatusList[
        data.scheduleStatusStep as ScheduleStatusStep
      ].find((s) => s.name === data.scheduleStatusName);
      if (status) {
        setSelectedStatus(status);
      }
      setSelectedCoverLetterId(data.coverLetterId || null);
    }
  }, [isOpen, mode, data]);

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
    if (title.length > 30) {
      toast.warning("일정 제목은 30자 이하로 입력해주세요.");
      return;
    }
    if (startDate > endDate) {
      toast.warning("시작 날짜가 종료 날짜보다 이후일 수 없습니다.");
      return;
    }
    if (memo.length > 160) {
      toast.warning("메모는 160자 이하로 입력해주세요.");
      return;
    }
    const scheduleData = {
      scheduleTitle: title,
      scheduleStartDate: startDate,
      scheduleEndDate: endDate,
      scheduleStatusName: selectedStatus.name,
      scheduleStatusStep: selectedStatus.step,
      scheduleMemo: memo,
      coverLetterId:
        selectedCoverLetterId === "none" ? null : selectedCoverLetterId,
      scheduleId: data?.scheduleId || null,
    };
    onSubmit(scheduleData);
    resetForm();
    onClose();
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(data?.scheduleId || 0);
    onClose();
    setIsDeleteModalOpen(false);
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
          {mode === "create" ? (
            <h2 className="text-2xl font-bold mb-5">일정 등록</h2>
          ) : (
            <h2 className="text-2xl font-bold mb-5">일정 수정</h2>
          )}
          <div className="space-y-3">
            {/* 일정 정보 */}
            <FormInput
              type="text"
              name="title"
              label="일정 제목"
              require
              placeholder="일정 제목을 입력해주세요(30자 이하)"
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
              options={coverLetterList || []}
              value={selectedCoverLetterId || null}
              onChange={setSelectedCoverLetterId}
              width="100%"
            />
            <FormInput
              type="text"
              name="memo"
              label="메모"
              placeholder="메모를 입력해주세요(160자 이하)"
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
                onClick={handleDeleteClick}
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

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="일정 삭제"
        warning={true}
      >
        <p>정말 삭제하시겠습니까?</p>
      </Modal>
    </div>
  );
}

export default ScheduleModal;
