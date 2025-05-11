import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import { timeParser } from "../../../hooks/timeParser";

interface CorporateReportCardProps {
  onClick: () => void;
  companyName: string;
  createdAt: string;
  companyViewCount: number;
  companyLocation: string;
  companyAnalysisBookmarkCount: number;
  bookmark: boolean;
  dartCategory?: string[];
}

function CorporateReportCard({
  onClick,
  companyName,
  createdAt,
  companyViewCount,
  companyLocation,
  companyAnalysisBookmarkCount,
  bookmark,
  dartCategory,
}: CorporateReportCardProps) {
  return (
    <div
      onClick={onClick}
      className="w-[220px] h-[180px] bg-white rounded-lg cursor-pointer border border-gray-200 p-3 hover:shadow-sm transition-shadow flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center w-full border-b border-[#AF9BFF]/80 pb-1 justify-between">
          <h3 className="text-base font-bold text-gray-800 truncate">
            {companyName}
          </h3>
          {bookmark ? (
            <FaBookmark className="text-[#6F52E0]" />
          ) : (
            <FaRegBookmark />
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
