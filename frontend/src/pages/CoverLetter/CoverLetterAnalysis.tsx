import { useEffect, useState } from "react";
import ReportList from "./components/ReportList";
import LetterStep from "./components/LetterStep";
import { useLocation, useNavigate } from "react-router";

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

  const handleStep = (stepNum: number) => {
    setNowStep(stepNum);
    navigate(stepUrl[stepNum]);
  };

  const stepUrl = [
    "/cover-letter/select-company",
    "/cover-letter/select-job",
    "/cover-letter/input-question",
    `/cover-letter/1`,
  ];

  return (
    <div className="flex justify-center gap-20 mt-10">
      {nowStep <= 2 && <ReportList nowStep={nowStep} />}
      <LetterStep nowStep={nowStep} handleStep={handleStep} />
    </div>
  );
}

export default CoverLetter;
