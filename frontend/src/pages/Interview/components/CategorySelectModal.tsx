import { Button } from "@/components/Button";
import { useSelectCategory } from "@/hooks/interviewHooks";
import { useInterviewStore } from "@/store/interviewStore";
import {
  InterviewCategory,
  StartQuestionInterviewResponse,
} from "@/types/interviewApiTypes";
import { FileText, Code, Users } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import CategorySelectModalLayout from "./\bCategorySelectModalLayout";

export type interviewType = "question" | "practice";
export interface TypeSelectModalProps {
  onClose: () => void;
}

function CategorySelectModal({ onClose }: TypeSelectModalProps) {
  const [isOpenCoverLetterSelectPanel, setIsOpenCoverLetterSelectPanel] =
    useState(false);
  const { setSelectCategory, selectInterviewType: type } = useInterviewStore();
  const navigate = useNavigate();
  //hooks
  const selectCategoryMutation = useSelectCategory();
  const clickOverlay = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleNavigationAfterSuccess = (
    response: StartQuestionInterviewResponse,
    selectCategory: InterviewCategory
  ) => {
    console.log(response);
    if (type === "question") {
      navigate(`/interview/${selectCategory}`, {
        state: response,
      });
    } else {
      navigate("interview/prepare", {
        state: response,
      });
    }
  };

  const handleSelectCategory = (selectCategory: InterviewCategory) => {
    setSelectCategory(selectCategory);

    if (type === "question") {
      if (selectCategory === "cover-letter") {
        navigate("/interview/cover-letter");
      } else if (selectCategory === "cs" || selectCategory === "personality") {
        selectCategoryMutation.mutate(selectCategory, {
          onSuccess: (res) => handleNavigationAfterSuccess(res, selectCategory),
        });
      }
    } else if (type === "practice") {
      if (selectCategory === "cover-letter") {
        setIsOpenCoverLetterSelectPanel(true);
      } else if (selectCategory === "cs" || selectCategory === "personality") {
        navigate(`/interview/prepare`);
      }
    }
  };

  const handleCloseCoverLetterList = () => {
    setIsOpenCoverLetterSelectPanel(false);
  };

  return (
    <>
      {isOpenCoverLetterSelectPanel && (
        <CategorySelectModalLayout onClose={handleCloseCoverLetterList} />
      )}

      <div onClick={(e) => clickOverlay(e)} className="modal-overlay">
        <div
          className="modal-container bg-white h-92 overflow-hidden "
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-center mb-8 text-[#2a2c35]">
            카테고리 선택
          </h2>

          <div className="flex gap-4">
            {/* 자기소개서 카테고리 */}
            <button
              className=" min-w-[240px] bg-[#f7f5ff] hover:bg-[#f5f7fd] active:bg-[#cec6f5] transition-all p-5 rounded-lg border border-[#e4e8f0] hover:border-[#886bfb] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#886bfb] group relative overflow-hidden"
              onClick={() => handleSelectCategory("cover-letter")}
            >
              <div className="absolute inset-0 bg-[#886bfb] opacity-0 group-hover:opacity-5 group-active:opacity-10 transition-opacity"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#886bfb] flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl text-[#2a2c35] mb-2">
                  자기소개서
                </h3>
                <p className="text-sm text-[#6e7180]">
                  자기소개서 기반 질문에 답변하기
                </p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#886bfb] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </button>

            {/* CS 카테고리 */}
            <button
              className="min-w-[240px] bg-[#f7f5ff] hover:bg-[#f5f7fd] active:bg-[#cec6f5] transition-all p-5 rounded-lg border border-[#e4e8f0] hover:border-[#af9bff] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#af9bff] group relative overflow-hidden"
              onClick={() => handleSelectCategory("cs")}
            >
              <div className="absolute inset-0 bg-[#af9bff] opacity-0 group-hover:opacity-5 group-active:opacity-10 transition-opacity"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#af9bff] flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform">
                  <Code className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl text-[#2a2c35] mb-2">CS</h3>
                <p className="text-sm text-[#6e7180]">
                  컴퓨터 과학 및 기술 관련 질문
                </p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#af9bff] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </button>

            {/* 인성 카테고리 */}
            <button
              className="min-w-[240px] bg-[#f7f5ff] hover:bg-[#f5f7fd] active:bg-[#cec6f5] transition-all p-5 rounded-lg border border-[#e4e8f0] hover:border-[#6f52e0] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#6f52e0] group relative overflow-hidden"
              onClick={() => handleSelectCategory("personality")}
            >
              <div className="absolute inset-0 bg-[#6f52e0] opacity-0 group-hover:opacity-5 group-active:opacity-10 transition-opacity"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#6f52e0] flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl text-[#2a2c35] mb-2">인성</h3>
                <p className="text-sm text-[#6e7180]">
                  인성 및 직무 적합성 관련 질문
                </p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#6f52e0] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </button>
          </div>

          <div className="mt-8 text-center">
            <Button
              variant={"white"}
              className="px-6 py-2 text-[#6e7180] hover:text-[#2a2c35] font-medium rounded-md hover:bg-[#f5f7fd] active:bg-[#cec6f5] transition-colors"
              onClick={() => onClose()}
            >
              취소
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CategorySelectModal;
