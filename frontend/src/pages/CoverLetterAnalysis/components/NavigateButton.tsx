import { Button } from "@/components/Button";
import { useStepValidation } from "@/hooks/stepValidationHook";

export interface NavigateButtonProps {
  nowStep: number;
  handleStep: (type: "next" | "before") => void;
  handleOpenCreateModal?: () => void;
}

function NavigateButton({
  nowStep,
  handleStep,
  handleOpenCreateModal,
}: NavigateButtonProps) {
  const { validateProceed } = useStepValidation();

  return (
    <div className="flex justify-end mt-4 gap-5">
      {nowStep !== 0 && handleStep && (
        <Button
          onClick={() => handleStep("before")}
          variant={"white"}
          size="lg"
        >
          이전
        </Button>
      )}

      {nowStep < 3 && handleStep && (
        <Button
          onClick={() => validateProceed(nowStep, () => handleStep("next"))}
          className="w-30 h-10"
        >
          다음
        </Button>
      )}

      {nowStep === 3 && handleOpenCreateModal && (
        <Button className="w-30 h-10" onClick={handleOpenCreateModal}>
          초안 생성
        </Button>
      )}
    </div>
  );
}

export default NavigateButton;
