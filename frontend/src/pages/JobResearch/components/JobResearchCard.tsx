import { jobRoleAnalysis } from "@/api/jobRoleAnalysisApi";
import { timeParser } from "@/hooks/timeParser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaRegBookmark, FaBookmark, FaLock } from "react-icons/fa";
import { toast } from "sonner";

interface JobResearchCardProps {
  onClick: () => void;
  modalClose?: () => void;
  jobRoleName: string;
  jobRoleAnalysisTitle: string;
  jobRoleCategory: string;
  jobRoleViewCount: number;
  jobRoleBookmarkCount: number;
  bookmark: boolean;
  createdAt: string;
  isPublic: boolean;
  jobId: number;
  companyId?: string;
  isFinding: boolean;
}

function JobResearchCard({
  onClick,
  modalClose,
  jobRoleName,
  jobRoleAnalysisTitle,
  jobRoleCategory,
  jobRoleViewCount,
  jobRoleBookmarkCount,
  bookmark,
  createdAt,
  isPublic,
  jobId,
  companyId,
  isFinding,
}: JobResearchCardProps) {
  const queryClient = useQueryClient();

  // 북마크 추가 mutation
  const addJobBookmarkMutation = useMutation({
    mutationFn: () =>
      jobRoleAnalysis.postBookmark({ jobRoleAnalysisId: jobId }),
    onSuccess: () => {
      console.log("북마크 추가 성공");
      queryClient.invalidateQueries({
        queryKey: ["jobRoleDetail", jobId],
      });
      if (companyId) {
        queryClient.invalidateQueries({
          queryKey: ["jobResearchList", companyId],
        });
        queryClient.invalidateQueries({
          queryKey: ["job-book-mark", parseInt(companyId)],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ["bookmarkedCompanyList"],
        });
        queryClient.invalidateQueries({
          queryKey: ["myCompanyList"],
        });
      }
    },
  });

  // 북마크 삭제 mutation
  const removeJobBookmarkMutation = useMutation({
    mutationFn: () => jobRoleAnalysis.deleteBookmark(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["jobRoleDetail", jobId],
      });
      if (companyId) {
        queryClient.invalidateQueries({
          queryKey: ["jobResearchList", companyId],
        });
        queryClient.invalidateQueries({
          queryKey: ["job-book-mark", parseInt(companyId)],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ["bookmarkedJobList"],
        });
        queryClient.invalidateQueries({
          queryKey: ["myJobList"],
        });
      }
    },
  });

  const handleBookmarkClickOn = (e: React.MouseEvent) => {
    e.stopPropagation();
    addJobBookmarkMutation.mutate();
  };
  const handleBookmarkClickOff = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeJobBookmarkMutation.mutate();
  };
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFinding && modalClose) {
      addJobBookmarkMutation.mutate();
      toast.info("북마크에 추가되었습니다.");
      modalClose();
    } else {
      onClick();
    }
  };
  const handleRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <div
      onClick={handleClick}
      className="w-[800px] h-[110px] border-l-4 border-[#6F4BFF] bg-white rounded-lg rounded-l-xs cursor-pointer shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between p-4"
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-[#333] mb-1 flex items-center">
              {isPublic ? (
                <></>
              ) : (
                <span className="text-gray-500 mr-2">
                  <FaLock size={12} />
                </span>
              )}
              {jobRoleAnalysisTitle}
            </h3>
            <span className="text-sm font-medium text-[#6F4BFF]">
              {jobRoleCategory}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#edeafb] text-[#6F4BFF] text-sm px-2 py-0.5 rounded-full">
              {jobRoleName}
            </span>
          </div>
        </div>
        <div className="flex items-center">
          {isFinding ? (
            <div
              onClick={handleRead}
              className="w-[48px] text-center bg-[#6F4BFF] px-2 py-0.5 text-white text-sm rounded-md"
            >
              읽기
            </div>
          ) : bookmark ? (
            <div className="" onClick={handleBookmarkClickOff}>
              <FaBookmark className="text-[#6F52E0]" />
            </div>
          ) : (
            <div className="" onClick={handleBookmarkClickOn}>
              <FaRegBookmark />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {jobRoleViewCount}
          </span>
          <span className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            {jobRoleBookmarkCount}
          </span>
        </div>
        <span className="text-xs text-gray-400">{timeParser(createdAt)}</span>
      </div>
    </div>
  );
}

export default JobResearchCard;
