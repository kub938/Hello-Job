export interface AddJobAnalysisModalProps {
  onClose: () => void;
}

function AddJobAnalysisModal({ onClose }: AddJobAnalysisModalProps) {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div onClick={handleOverlayClick} className="modal-overlay">
      <div className="modal-container"></div>
    </div>
  );
}

export default AddJobAnalysisModal;
