import { useState } from "react";
import ReportList from "./components/ReportList";
import CoverLetterAnalysisLayout from "./components/CoverLetterAnalysisLayout";
import InputQuestion from "./components/InputQuestion/InputQuestion";
import JobCompanyForm from "./components/JobCompanyForm";
import NavigateButton from "./components/NavigateButton";
import { useMultiForm } from "../../utils/useMultiForm";

function CoverLetter() {
  const { Step, handleStep, nowStep, MultiForm } = useMultiForm();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  return (
    <>
      <CoverLetterAnalysisLayout nowStep={nowStep}>
        <MultiForm>
          <Step step={0}>
            <JobCompanyForm />
          </Step>
          <Step step={1}>
            <ReportList nowStep={nowStep} />
          </Step>
          <Step step={2}>
            <ReportList nowStep={nowStep} />
          </Step>
          <Step step={3}>
            <InputQuestion
              createModalOpen={createModalOpen}
              setCreateModalOpen={setCreateModalOpen}
            />
          </Step>
        </MultiForm>
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
