import { useCallback, useEffect, useState } from "react";
import ReportList from "./components/ReportList";
import { useLocation, useNavigate } from "react-router";
import CoverLetterAnalysisLayout from "./components/CoverLetterAnalysisLayout";
import InputQuestion from "./InputQuestion/InputQuestion";
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
    // navigate(stepUrl[nowStep]);
  }, []);

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };
  // useEffect(() => {
  //   switch (pathname) {
  //     case stepUrl[0]:
  //       setNowStep(0);
  //       break;
  //     case stepUrl[1]:
  //       setNowStep(1);
  //       break;
  //     case stepUrl[2]:
  //       setNowStep(2);
  //       break;
  //     case stepUrl[3]:
  //       setNowStep(3);
  //       break;
  //   }
  // }, [pathname]);

  // const stepUrl = [
  //   "/cover-letter",
  //   "/cover-letter/select-company",
  //   "/cover-letter/select-job",
  //   "/cover-letter/input-question",
  //   `/cover-letter/1`,
  // ];

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
