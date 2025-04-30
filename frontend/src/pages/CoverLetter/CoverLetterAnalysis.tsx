import { useCallback, useEffect, useState } from "react";
import ReportList from "./components/ReportList";
import { useLocation, useNavigate } from "react-router";
import CoverLetterAnalysisLayout from "./components/CoverLetterAnalysisLayout";
import InputQuestion from "./components/InputQuestion";

function CoverLetter() {
  const [nowStep, setNowStep] = useState(0);
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  console.log(nowStep);
  useEffect(() => {
    switch (pathname) {
      case stepUrl[0]:
        setNowStep(0);
        break;
      case stepUrl[1]:
        setNowStep(1);
        break;
      case stepUrl[2]:
        setNowStep(2);
        break;
    }
  }, [pathname]);

  const handleStep = useCallback((stepNum: number) => {
    setNowStep(stepNum);
    navigate(stepUrl[stepNum]);
  }, []);

  const stepUrl = [
    "/cover-letter/select-company",
    "/cover-letter/select-job",
    "/cover-letter/input-question",
    `/cover-letter/1`,
  ];

  return (
    <>
      <CoverLetterAnalysisLayout nowStep={nowStep} handleStep={handleStep}>
        {nowStep <= 1 && <ReportList />}
        {nowStep === 2 && <InputQuestion />}
      </CoverLetterAnalysisLayout>
    </>
  );
}

export default CoverLetter;
