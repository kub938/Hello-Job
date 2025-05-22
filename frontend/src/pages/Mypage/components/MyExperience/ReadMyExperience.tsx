import { deleteMyExperience, getMyExperienceDetail } from "@/api/mypageApi";
import { Button } from "@/components/Button";
import { timeParser } from "@/hooks/timeParser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ExperienceEdit from "./ExperienceEdit";
import ExperienceInfo from "./ExperienceInfo";
import Modal from "@/components/Modal";

interface ReadMyExperienceProps {
  id: number;
  page: number;
  onClose: () => void;
}

function ReadMyExperience({ id, page, onClose }: ReadMyExperienceProps) {
  const [isValidId, setIsValidId] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const queryClient = useQueryClient();

  // id 유효성 검사
  useEffect(() => {
    if (Number.isInteger(id) && id > 0) {
      setIsValidId(true);
    } else {
      setIsValidId(false);
    }
  }, [id]);

  // 내 경험 상세 정보 불러오기
  const { data: experienceDetail, isLoading } = useQuery({
    queryKey: ["experienceDetail", id],
    queryFn: async () => {
      const response = await getMyExperienceDetail(id);
      return response.data;
    },
    enabled: isValidId,
  });

  // 내 경험 삭제
  const { mutate: deleteExperience } = useMutation({
    mutationFn: async () => {
      const response = await deleteMyExperience(id);
      return response.data;
    },
    onSuccess: () => {
      // 삭제 성공 시, 게시글 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["myExperienceList", page] });
      onClose(); // 모달 닫기
    },
  });

  const handleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleEditComplete = () => {
    setIsEditMode(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteExperience();
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="h-[90vh] w-[940px] bg-white rounded-t-xl py-8 px-12 overflow-y-auto">
      <header className="flex w-full justify-between items-end mb-4">
        <h1 className="text-2xl font-bold">
          {isLoading ? "로딩 중..." : experienceDetail?.experienceName} -{" "}
          {isLoading || !experienceDetail?.updatedAt
            ? ""
            : timeParser(experienceDetail?.updatedAt)}
        </h1>
        {isEditMode ? (
          <></>
        ) : (
          <div className="flex gap-4">
            <Button onClick={() => handleEditMode()} variant={"white"}>
              수정
            </Button>
            <Button
              className=" hover:bg-red-600 hover:text-white hover:border-red-600 active:bg-red-700 active:text-white active:border-red-700"
              onClick={handleDeleteClick}
              variant={"white"}
            >
              삭제
            </Button>
          </div>
        )}
      </header>

      {/* 내용 */}
      {isEditMode ? (
        <>
          <ExperienceEdit
            experienceDetail={experienceDetail}
            experienceId={id}
            page={page}
            onEditComplete={handleEditComplete}
          />

          <div className="mt-12 flex justify-center gap-4">
            <Button
              className="px-4 text-base"
              onClick={() => handleEditMode()}
              variant="white"
            >
              취소
            </Button>
            <Button
              className="px-4 text-base"
              variant="default"
              type="submit"
              form="experience-edit-form"
            >
              수정 완료
            </Button>
          </div>
        </>
      ) : (
        <>
          <ExperienceInfo
            experienceDetail={experienceDetail}
            isLoading={isLoading}
          />

          <div className="mt-12 flex justify-center gap-4">
            <Button
              className="px-4 text-base"
              onClick={onClose}
              variant="default"
            >
              확인
            </Button>
          </div>
        </>
      )}

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="경험 삭제"
        warning={true}
      >
        <p>정말 삭제하시겠습니까?</p>
      </Modal>
    </div>
  );
}

export default ReadMyExperience;
