import CorporateResearch from "@/pages/CorporateResearch/CorporateResearch";
import { useSelectCompanyStore } from "@/store/coverLetterAnalysisStore";

export interface CompanyAnalysisModalProps {
  onClose: () => void;
}

function AddCompanyAnalysisModal({ onClose }: CompanyAnalysisModalProps) {
  const { company } = useSelectCompanyStore();

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div onClick={handleOverlayClick} className="modal-overlay">
      <div className="modal-container h-[80%]">
        <CorporateResearch
          type="modal"
          companyId={company.companyId}
        ></CorporateResearch>
      </div>
    </div>
  );
}

export default AddCompanyAnalysisModal;
