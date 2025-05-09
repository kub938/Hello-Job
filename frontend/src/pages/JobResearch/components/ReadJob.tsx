import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import { useState, useEffect } from "react";
import { jobRoleAnalysis } from "@/api/jobRoleAnalysisApi";
import { Button } from "@/components/Button";

interface ReadJobProps {
  onClose: () => void;
  id: number;
}

function ReadJob({ onClose, id }: ReadJobProps) {
  const queryClient = useQueryClient();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isValidId, setIsValidId] = useState(false);
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
      queryClient.invalidateQueries({ queryKey: ["jobRoleList"] });
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
      queryClient.invalidateQueries({ queryKey: ["jobRoleList"] });
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

  return (
    <div className="h-[90vh] w-[940px] bg-white rounded-t-xl py-8 px-12 overflow-y-auto">
      <header className="flex w-full justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            {isLoading || !jobDetail ? "로딩 중..." : jobDetail.companyName} -{" "}
            {isLoading || !jobDetail ? "" : jobDetail.jobRoleAnalysisTitle}
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
      ) : (
        <div className="space-y-8">
          {/* 카테고리 및 조회수 정보 */}
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="px-3 py-1 bg-[#6F52E0]/10 text-[#6F52E0] rounded-md text-sm">
              {jobDetail.jobRoleName}
            </span>
            <div className="text-sm text-gray-500">
              <span>조회수: {jobDetail.jobRoleViewCount}</span>
              <span className="mx-2">|</span>
              <span>북마크: {jobDetail.jobRoleAnalysisBookmarkCount}</span>
            </div>
          </div>

          {/* 주요 업무 */}
          <section>
            <h2 className="text-lg font-bold mb-2">주요 업무</h2>
            <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-line">
              {jobDetail.jobRoleWork}
            </div>
          </section>

          {/* 기술 스택 */}
          <section>
            <h2 className="text-lg font-bold mb-2">기술 스택</h2>
            <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-line">
              {jobDetail.jobRoleSkills
                ? jobDetail.jobRoleSkills
                : "등록된 정보가 없습니다."}
            </div>
          </section>

          {/* 자격 요건 */}
          <section>
            <h2 className="text-lg font-bold mb-2">자격 요건</h2>
            <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-line">
              {jobDetail.jobRoleRequirements
                ? jobDetail.jobRoleRequirements
                : "등록된 정보가 없습니다."}
            </div>
          </section>

          {/* 우대 사항 */}
          <section>
            <h2 className="text-lg font-bold mb-2">우대 사항</h2>
            <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-line">
              {jobDetail.jobRolePreferences
                ? jobDetail.jobRolePreferences
                : "등록된 정보가 없습니다."}
            </div>
          </section>

          {/* 기타 정보 */}
          <section>
            <h2 className="text-lg font-bold mb-2">커스텀 정보 & 프롬프트</h2>
            <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-line">
              {jobDetail.jobRoleEtc
                ? jobDetail.jobRoleEtc
                : "등록된 정보가 없습니다."}
            </div>
          </section>
        </div>
      )}

      <div className="mt-8 text-end">
        <Button className="px-6" onClick={onClose}>
          창 닫기
        </Button>
      </div>
    </div>
  );
}

export default ReadJob;
