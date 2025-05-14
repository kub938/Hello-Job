import { LoaderFunctionArgs, redirect } from "react-router";
import { toast } from "sonner";

const VALID_CATEGORIES = ["cs", "cover-letter", "personality"];

// 카테고리 검증 loader 함수
export const categoryValidator = ({ params }: LoaderFunctionArgs) => {
  if (!params.category || !VALID_CATEGORIES.includes(params.category)) {
    if (typeof window !== "undefined") {
      toast.error("유효하지 않은 카테고리입니다.");
    }
    throw redirect("/interview/select");
  }
  return { category: params.category };
};
