import { FaRegBookmark, FaBookmark, FaLock } from "react-icons/fa";
import { timeParser } from "../../../hooks/timeParser";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { corporateReportApi } from "@/api/corporateReport";

interface CorporateReportCardProps {
  onClick: () => void;
  modalClose?: () => void;
  companyAnalysisTitle: string;
  createdAt: string;
  companyViewCount: number;
  companyLocation: string;
  companyAnalysisBookmarkCount: number;
  bookmark: boolean;
  dartCategory?: string[];
  isPublic: boolean;
  reportId: number;
  companyId?: string;
  isFinding: boolean;
}

function CorporateReportCard({
  onClick,
  modalClose,
  companyAnalysisTitle,
  createdAt,
  companyViewCount,
  companyLocation,
  companyAnalysisBookmarkCount,
  bookmark,
  dartCategory,
  isPublic,
  reportId,
  companyId,
  isFinding,
}: CorporateReportCardProps) {
  const queryClient = useQueryClient();

  // 북마크 추가 mutation
  const addBookmarkMutation = useMutation({
    mutationFn: () =>
      corporateReportApi.postBookmark({ companyAnalysisId: reportId }),
    onSuccess: () => {
      console.log("북마크 추가 성공");
      queryClient.invalidateQueries({
        queryKey: ["corporateReportDetail", reportId],
      });
      if (companyId) {
        queryClient.invalidateQueries({
          queryKey: ["corporateReportList", companyId],
        });
        queryClient.invalidateQueries({
          queryKey: ["companyBookMark", parseInt(companyId)],
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
  const removeBookmarkMutation = useMutation({
    mutationFn: () => corporateReportApi.deleteBookmark(reportId),
    onSuccess: () => {
      console.log("북마크 삭제 성공");
      queryClient.invalidateQueries({
        queryKey: ["corporateReportDetail", reportId],
      });
      if (companyId) {
        queryClient.invalidateQueries({
          queryKey: ["corporateReportList", companyId],
        });
        queryClient.invalidateQueries({
          queryKey: ["companyBookMark", parseInt(companyId)],
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

  const handleBookmarkClickOn = (e: React.MouseEvent) => {
    e.stopPropagation();
    addBookmarkMutation.mutate();
  };
  const handleBookmarkClickOff = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeBookmarkMutation.mutate();
  };
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFinding && modalClose) {
      addBookmarkMutation.mutate();
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
      className="w-[220px] h-[180px] bg-white rounded-lg cursor-pointer border border-gray-200 p-3 hover:shadow-sm transition-shadow flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center w-full border-b border-[#AF9BFF]/80 pb-1 justify-between">
          {isPublic ? (
            <></>
          ) : (
            <span className="text-gray-500 mr-1">
              <FaLock size={12} />
            </span>
          )}
          <h3 className="text-base font-bold text-gray-800 w-full truncate">
            {companyAnalysisTitle}
          </h3>
          {isFinding ? (
            <div
              className="w-[48px] text-center bg-[#6F4BFF] px-2 py-0.5 text-white text-sm rounded-md"
              onClick={handleRead}
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
        <p className="text-sm text-gray-600 mt-1 truncate">{companyLocation}</p>
        <p className="text-sm text-gray-500 mt-1">{timeParser(createdAt)}</p>

        <div className="flex flex-wrap gap-1 mt-2 min-h-[40px]">
          {dartCategory?.map((category, index) => (
            <span
              key={index}
              className="text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-0.5 h-[18px]"
            >
              {category}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-end text-sm text-gray-600 mt-2">
          <span className="flex items-center">
            <svg
              className="w-3 h-3 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            {companyViewCount}
          </span>
          <span className="flex items-center ml-2">
            <svg
              className="w-3 h-3 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            {companyAnalysisBookmarkCount}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CorporateReportCard;
