import { CheckCircle, StickyNote } from "lucide-react";

function QuestionItem({
  question,
  isSelected,
  onSelect,
}: {
  question: any;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-lg border p-4 transition-all ${
        isSelected
          ? "border-primary bg-secondary-light shadow-sm"
          : "border-border bg-white hover:border-primary/30 hover:bg-secondary-light/50"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-grow">
          <div
            className={`flex-shrink-0 rounded-full w-6 h-6 border-2 flex items-center justify-center transition-colors ${
              isSelected
                ? "border-primary bg-primary text-white"
                : "border-muted-foreground"
            }`}
          >
            {isSelected && <CheckCircle className="w-4 h-4" />}
          </div>

          <p className="text-secondary-foreground font-medium">
            {question.question}
          </p>
        </div>

        {/* <button
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/30 transition-all ml-auto flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            // 메모 기능 처리
          }}
        >
          <StickyNote className="h-4 w-4" />
          메모하기
        </button> */}
      </div>
    </div>
  );
}
export default QuestionItem;
