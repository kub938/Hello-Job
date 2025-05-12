import { deleteCoverLetter, getCoverLetterDetail } from "@/api/mypageApi";
import { Button } from "@/components/Button";
import Modal from "@/components/Modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";

interface ReadCoverLetterProps {
  id: number;
  page: number;
  onClose: () => void;
}

function ReadCoverLetter({ onClose, id, page }: ReadCoverLetterProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: coverLetterDetailData, isLoading } = useQuery({
    queryKey: ["coverLetterDetailData", id],
    queryFn: async () => {
      const response = await getCoverLetterDetail(id.toString());
      return response.data;
    },
  });

  const { mutate: deleteCoverLetterFn } = useMutation({
    mutationFn: async () => {
      const response = await deleteCoverLetter(id);
      return response.data;
    },
    onSuccess: () => {
      // 삭제 성공 시, 게시글 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["coverLetterList", page] });
      onClose(); // 모달 닫기
    },
  });

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteCoverLetterFn();
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="h-[90vh] w-[940px] bg-white rounded-t-xl py-8 px-12 overflow-y-auto">
      <header className="flex w-full justify-between items-end mb-4">
        <h1 className="text-2xl font-bold mb-4">자기소개서 열람</h1>
        <div className="flex gap-4">
          <Button onClick={() => navigate("/")} variant={"white"}>
            수정
          </Button>
          <Button
            className="hover:bg-red-600 hover:text-white hover:border-red-600 active:bg-red-700 active:text-white active:border-red-700"
            onClick={handleDeleteClick}
            variant={"white"}
          >
            삭제
          </Button>
        </div>
      </header>
      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <div className="text-text-muted-foreground">로딩 중...</div>
        </div>
      ) : (
        <div className="space-y-8">
          {coverLetterDetailData?.contents.map((coverLetter) => (
            <div
              key={coverLetter.contentId}
              className="border border-[#E4E8F0] rounded-lg p-6 bg-white shadow-sm"
            >
              <div className="border-l-4 border-primary pl-4 mb-4">
                <h2 className="text-lg font-semibold text-[#2A2C35] mb-2">
                  {coverLetter.contentNumber}번 문항
                </h2>
                <h3 className="text-lg text-[#6E7180]">
                  {coverLetter.contentQuestion}
                </h3>
              </div>
              <div className="mt-4 bg-[#F8F9FC] p-4 rounded-md text-[#2A2C35]">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {coverLetter.contentDetail}
                </p>
                <div className="flex justify-end mt-2 text-sm text-[#6E7180]">
                  {coverLetter.contentLength}자
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 flex justify-center gap-4">
        <Button className="px-4 text-base" onClick={onClose} variant="default">
          확인
        </Button>
      </div>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="프로젝트 삭제"
        warning={true}
      >
        <p>정말 삭제하시겠습니까?</p>
      </Modal>
    </div>
  );
}

export default ReadCoverLetter;
