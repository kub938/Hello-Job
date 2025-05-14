import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaRegBookmark, FaBookmark, FaLock } from "react-icons/fa";
import { useState, useEffect } from "react";
import { jobRoleAnalysis } from "@/api/jobRoleAnalysisApi";
import { Button } from "@/components/Button";
import Modal from "@/components/Modal";
import JobInfo from "./JobInfo";
import JobEdit from "./JobEdit";

interface ReadJobProps {
  onClose: () => void;
  id: number;
  companyId: string;
}

function ReadJob({ onClose, id, companyId }: ReadJobProps) {
  const queryClient = useQueryClient();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isValidId, setIsValidId] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // id 유효성 검사
  useEffect(() => {
    if (Number.isInteger(id) && id > 0) {
      setIsValidId(true);
    } else {
      setIsValidId(false);
    }
  }, [id]);

  // 직무 분석 레포트 상세 정보 불러오기
  const { data: jobDetail, isLoading } = useQuery({
    queryKey: ["jobRoleDetail", id],
    queryFn: async () => {
      const response = await jobRoleAnalysis.getJobDetail(id);
      return response.data;
    },
    enabled: isValidId,
  });

  // 직무 분석 레포트 삭제 mutation
  const { mutate: deleteJob } = useMutation({
    mutationFn: () => jobRoleAnalysis.deleteJobRoleAnalysis(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["jobResearchList", companyId],
      });
      // 마이 페이지 직무 목록도 갱싱해야 함
      // queryClient.invalidateQueries({ queryKey: ["jobResearchList", companyId] });
      onClose();
    },
  });

  // jobDetail이이 변경될 때 북마크 상태 업데이트
  useEffect(() => {
    if (jobDetail) {
      setIsBookmarked(jobDetail.bookmark);
    }
  }, [jobDetail]);

  // 북마크 추가 mutation
  const addJobBookmarkMutation = useMutation({
    mutationFn: () => jobRoleAnalysis.postBookmark({ jobRoleAnalysisId: id }),
    onSuccess: () => {
      console.log("북마크 추가 성공");
      setIsBookmarked(true);
      queryClient.invalidateQueries({
        queryKey: ["jobRoleDetail", id],
      });
      queryClient.invalidateQueries({ queryKey: ["jobRoleList", companyId] });
    },
  });

  // 북마크 삭제 mutation
  const removeJobBookmarkMutation = useMutation({
    mutationFn: () => jobRoleAnalysis.deleteBookmark(id),
    onSuccess: () => {
      console.log("북마크 삭제 성공");
      setIsBookmarked(false);
      queryClient.invalidateQueries({
        queryKey: ["jobRoleDetail", id],
      });
      queryClient.invalidateQueries({ queryKey: ["jobRoleList", companyId] });
    },
  });
  // 북마크 토글 핸들러
  const toggleBookmark = () => {
    if (isBookmarked) {
      removeJobBookmarkMutation.mutate();
    } else {
      addJobBookmarkMutation.mutate();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

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
    deleteJob();
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="h-[90vh] w-[940px] bg-white rounded-t-xl py-8 px-12 overflow-y-auto">
      <header className="flex w-full justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            {isLoading || !jobDetail ? (
              "로딩 중..."
            ) : (
              <>
                {jobDetail.isPublic === false && (
                  <FaLock
                    className="inline-block mr-2 text-gray-500"
                    size={16}
                  />
                )}
                {jobDetail.companyName}
              </>
            )}{" "}
            - {isLoading || !jobDetail ? "" : jobDetail.jobRoleAnalysisTitle}
          </h1>
          <p className="text-gray-500 text-sm">
            {isLoading || !jobDetail ? "" : jobDetail.jobRoleCategory} | 작성일:{" "}
            {isLoading || !jobDetail ? "" : formatDate(jobDetail.createdAt)}
          </p>
        </div>
        <button
          onClick={toggleBookmark}
          className="flex cursor-pointer items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors border border-gray-200"
        >
          {isBookmarked ? (
            <FaBookmark className="text-[#6F52E0]" />
          ) : (
            <FaRegBookmark />
          )}
          <span>북마크</span>
        </button>
      </header>

      {isLoading || !jobDetail ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">로딩 중...</p>
        </div>
      ) : isEditMode ? (
        <>
          <JobEdit
            onEditComplete={handleEditComplete}
            jobDetail={jobDetail}
            jobId={id}
            companyId={companyId}
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
              form="job-edit-form"
            >
              수정 완료
            </Button>
          </div>
        </>
      ) : (
        <>
          <JobInfo jobDetail={jobDetail} />
          <div className="mt-8 flex gap-4 justify-end">
            {/* {jobDetail?.writtenByMe && ( */}
            {true && (
              <>
                <Button
                  className="px-6"
                  variant="white"
                  onClick={() => handleEditMode()}
                >
                  수정
                </Button>
                <Button
                  className="px-6  hover:bg-red-600 hover:text-white hover:border-red-600 active:bg-red-700 active:text-white active:border-red-700"
                  variant="white"
                  onClick={handleDeleteClick}
                >
                  삭제
                </Button>
              </>
            )}
            <Button className="px-6" onClick={onClose}>
              창 닫기
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

export default ReadJob;
