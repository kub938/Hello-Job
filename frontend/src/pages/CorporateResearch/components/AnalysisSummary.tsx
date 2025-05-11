import { getCorporateReportDetailResponse } from "@/types/coporateResearch";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaIndustry,
  FaRegEye,
  FaRegBookmark,
  FaCalendarAlt,
  FaTags,
  FaLightbulb,
  FaTrademark,
} from "react-icons/fa";
import { BsGraphUp } from "react-icons/bs";
import { timeParser } from "@/hooks/timeParser";

// 분석 요약 컴포넌트
function AnalysisSummary({
  reportDetail,
}: {
  reportDetail?: getCorporateReportDetailResponse;
}) {
  if (!reportDetail) return null;

  return (
    <div className="space-y-10 pb-12">
      <section>
        <h3 className="font-bold text-2xl mb-4 text-[#2A2C35] flex items-center">
          <span className="bg-[#AF9BFF]/20 p-2 rounded-md mr-3 text-[#886BFB]">
            <FaTags className="w-5 h-5" />
          </span>
          분석에 사용한 정보
        </h3>
        <div className="flex flex-wrap gap-2">
          {reportDetail.dartCategory.map((category, index) => (
            <span
              key={index}
              className="px-4 py-1.5 bg-[#F0EBFF]/50 text-[#6F52E0] rounded-full text-sm font-medium transition-all"
            >
              {category}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-bold text-2xl mb-4 text-[#2A2C35] flex items-center">
          <span className="bg-[#AF9BFF]/20 p-2 rounded-md mr-3 text-[#886BFB]">
            <FaBuilding className="w-5 h-5" />
          </span>
          기업 기본 정보
        </h3>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E4E8F0] transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="text-[#886BFB] mt-0.5">
                <FaBuilding />
              </div>
              <div>
                <p className="text-sm text-[#6E7180]">기업명</p>
                <p className="font-semibold">{reportDetail.companyName}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-[#886BFB] mt-0.5">
                <FaIndustry />
              </div>
              <div>
                <p className="text-sm text-[#6E7180]">산업군</p>
                <p className="font-semibold">{reportDetail.companyIndustry}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-[#886BFB] mt-0.5">
                <FaMapMarkerAlt />
              </div>
              <div>
                <p className="text-sm text-[#6E7180]">위치</p>
                <p className="font-semibold">{reportDetail.companyLocation}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-[#886BFB] mt-0.5">
                <BsGraphUp />
              </div>
              <div>
                <p className="text-sm text-[#6E7180]">기업 규모</p>
                <p className="font-semibold">{reportDetail.companySize}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-[#886BFB] mt-0.5">
                <FaRegEye />
              </div>
              <div>
                <p className="text-sm text-[#6E7180]">조회수</p>
                <p className="font-semibold">{reportDetail.companyViewCount}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-[#886BFB] mt-0.5">
                <FaRegBookmark />
              </div>
              <div>
                <p className="text-sm text-[#6E7180]">북마크 수</p>
                <p className="font-semibold">
                  {reportDetail.companyAnalysisBookmarkCount}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 col-span-full">
              <div className="text-[#886BFB] mt-0.5">
                <FaCalendarAlt />
              </div>
              <div>
                <p className="text-sm text-[#6E7180]">기업 분석 작성일</p>
                <p className="font-semibold">
                  {timeParser(reportDetail.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-bold text-2xl mb-4 text-[#2A2C35] flex items-center">
          <span className="bg-[#AF9BFF]/20 p-2 rounded-md mr-3 text-[#886BFB]">
            <FaTrademark className="w-5 h-5" />
          </span>
          브랜드 정보
        </h3>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E4E8F0] transition-all">
          <p className="leading-relaxed">{reportDetail.dartBrand}</p>
        </div>
      </section>

      <section>
        <h3 className="font-bold text-2xl mb-4 text-[#2A2C35] flex items-center">
          <span className="bg-[#AF9BFF]/20 p-2 rounded-md mr-3 text-[#886BFB]">
            <FaLightbulb className="w-5 h-5" />
          </span>
          비전 및 전략
        </h3>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E4E8F0] transition-all">
          <p className="leading-relaxed">{reportDetail.dartVision}</p>
        </div>
      </section>
    </div>
  );
}

export default AnalysisSummary;
