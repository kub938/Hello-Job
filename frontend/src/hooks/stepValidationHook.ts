import { useSelectCompanyStore } from "@/store/coverLetterAnalysisStore";
import { useCoverLetterInputStore } from "@/store/coverLetterStore";
import { toast } from "sonner";

export const useStepValidation = () => {
  const { inputData } = useCoverLetterInputStore();
  const { company } = useSelectCompanyStore();

  const validateStep = (
    step: number
  ): { isValid: boolean; message: string } => {
    switch (step) {
      case 0:
        if (company.companyId === -1) {
          return {
            isValid: false,
            message: "기업을 선택해 주세요",
          };
        }
        break;
      case 1:
        if (inputData.companyAnalysisId === null) {
          return {
            isValid: false,
            message: "기업 분석 데이터를 선택해 주세요",
          };
        }
        break;
    }

    return { isValid: true, message: "" };
  };

  const validateProceed = (nowStep: number, onSuccess: () => void): void => {
    console.log(nowStep);
    const validation = validateStep(nowStep);

    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    onSuccess();
  };

  return { validateStep, validateProceed };
};
