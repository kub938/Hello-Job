import { deleteMyProject, getMyProjectDetail } from "@/api/mypageApi";
import { Button } from "@/components/Button";
import { timeParser } from "@/hooks/timeParser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import ProjectInfo from "./ProjectInfo";
import ProjectEdit from "./ProjectEdit";

interface ReadMyProjectProps {
  id: number;
  page: number;
  onClose: () => void;
}

function ReadMyProject({ id, page, onClose }: ReadMyProjectProps) {
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

  // 내 프로젝트 상세 정보 불러오기
  const { data: projectDetail, isLoading } = useQuery({
    queryKey: ["projectDetail", id],
    queryFn: async () => {
      const response = await getMyProjectDetail(id);
      return response.data;
    },
    enabled: isValidId,
  });

  // 내 프로젝트 삭제
  const { mutate: deleteProject } = useMutation({
    mutationFn: async () => {
      const response = await deleteMyProject(id);
      return response.data;
    },
    onSuccess: () => {
      // 삭제 성공 시, 게시글 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["myProjectList", page] });
      onClose(); // 모달 닫기
    },
  });

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteProject();
    setIsDeleteModalOpen(false);
  };

  const handleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleEditComplete = () => {
    setIsEditMode(false);
  };

  return (
    <div className="h-[90vh] w-[940px] bg-white rounded-t-xl py-8 px-12 overflow-y-auto">
      <header className="flex w-full justify-between items-end mb-4">
        <h1 className="text-2xl font-bold">
          {isLoading ? "로딩 중..." : projectDetail?.projectName} -{" "}
          {isLoading || !projectDetail?.updatedAt
            ? ""
            : timeParser(projectDetail?.updatedAt)}
        </h1>
        {isEditMode ? (
          <></>
        ) : (
          <div className="flex gap-4">
            <Button onClick={() => handleEditMode()} variant={"white"}>
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
        )}
      </header>

      {/* 내용 */}
      {isEditMode ? (
        <>
          <ProjectEdit
            projectDetail={projectDetail}
            projectId={id}
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
              form="project-edit-form"
            >
              수정 완료
            </Button>
          </div>
        </>
      ) : (
        <>
          <ProjectInfo projectDetail={projectDetail} isLoading={isLoading} />

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
        title="프로젝트 삭제"
        warning={true}
      >
        <p>정말 삭제하시겠습니까?</p>
      </Modal>
    </div>
  );
}

export default ReadMyProject;
