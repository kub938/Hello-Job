export type interviewType = "question" | "practice";

export interface TypeSelectModalProps {
  type: interviewType;
  onClose: () => void;
}
