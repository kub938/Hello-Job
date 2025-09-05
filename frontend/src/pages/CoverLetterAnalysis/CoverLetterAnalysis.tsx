import { useCallback, useState } from "react";
import ReportList from "./components/ReportList";
import CoverLetterAnalysisLayout from "./components/CoverLetterAnalysisLayout";
import InputQuestion from "./components/InputQuestion/InputQuestion";
import JobCompanyForm from "./components/JobCompanyForm";
import NavigateButton from "./components/NavigateButton";

function CoverLetter() {
  const [nowStep, setNowStep] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleStep = useCallback((type: "next" | "before") => {
    if (type === "next") {
      setNowStep((prev) => prev + 1);
    } else {
      setNowStep((prev) => prev - 1);
    }
  }, []);

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  return (
    <>
      <CoverLetterAnalysisLayout nowStep={nowStep}>
        {nowStep === 0 && <JobCompanyForm />}
        {(nowStep === 2 || nowStep === 1) && <ReportList nowStep={nowStep} />}
        {nowStep === 3 && (
          <InputQuestion
            createModalOpen={createModalOpen}
            setCreateModalOpen={setCreateModalOpen}
          />
        )}
        <NavigateButton
          nowStep={nowStep}
          handleStep={handleStep}
          handleOpenCreateModal={handleOpenCreateModal}
        />
      </CoverLetterAnalysisLayout>
    </>
  );
}

export default CoverLetter;
