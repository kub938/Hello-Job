import CorporateResearch from "@/pages/CorporateResearch/CorporateResearch";
import JobResearch from "@/pages/JobResearch/JobResearch";
import { useSelectCompanyStore } from "@/store/coverLetterAnalysisStore";

export interface CompanyAnalysisModalProps {
  onClose: () => void;
  type: "company" | "job";
}

function AddAnalysisModal({ onClose, type }: CompanyAnalysisModalProps) {
  const { company } = useSelectCompanyStore();

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div onClick={handleOverlayClick} className="modal-overlay">
      <div className="modal-container h-[80%]">
        {type === "company" ? (
          <CorporateResearch
            type="modal"
            companyId={company.companyId}
          ></CorporateResearch>
        ) : (
          <JobResearch type="modal" companyId={company.companyId} />
        )}
      </div>
    </div>
  );
}

export default AddAnalysisModal;
