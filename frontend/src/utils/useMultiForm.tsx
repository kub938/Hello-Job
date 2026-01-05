import React from "react";
import { useState, ReactNode, FC } from "react";

interface StepProps {
  step?: number;
  children: React.ReactNode;
}

interface MultiFormResponse {
  nowStep: number;
  handleStep: (type: "next" | "before") => void;
  Step: FC<StepProps>;
  MultiForm: FC<{ children: ReactNode }>;
}

export const useMultiForm = (): MultiFormResponse => {
  const [nowStep, setNowStep] = useState(0);

  console.log(nowStep, "useMultiForm의 스텝");
  const handleStep = (type: "next" | "before") => {
    if (type === "next") {
      setNowStep((prev) => prev + 1);
    } else {
      setNowStep((prev) => prev - 1);
    }
  };

  const Step = ({ children }: StepProps) => <>{children}</>;

  const MultiForm = ({ children }: { children: React.ReactNode }) => {
    const targetStep = React.Children.toArray(children).find(
      (child: any) => child.props.step === nowStep
    );

    return <>{targetStep}</>;
  };

  const multiForm: MultiFormResponse = {
    nowStep,
    handleStep,
    Step,
    MultiForm,
  };
  return multiForm;
};
