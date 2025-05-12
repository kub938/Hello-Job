import { Section } from "@/hooks/researchParseHook";
import { getCorporateReportDetailResponse } from "@/types/coporateResearch";
import { FaChartBar, FaFileAlt } from "react-icons/fa";

// 공시 정보 컴포넌트
function PublicInformation({
  reportDetail,
  dartCompanyAnalysis,
  dartFinancialSummery,
}: {
  reportDetail?: getCorporateReportDetailResponse;
  dartCompanyAnalysis: Section[];
  dartFinancialSummery: Section[];
}) {
  if (!reportDetail) return null;

  return (
    <div className="space-y-12 pb-12">
      <section>
        <div>
          {dartCompanyAnalysis.map((item, idx) =>
            item.type === "title" ? (
              <h3
                key={idx}
                className="font-bold text-2xl mb-4 mt-8 text-[#2A2C35] flex items-center"
              >
                <span className="bg-[#AF9BFF]/20 p-2 rounded-md mr-3 text-[#886BFB]">
                  <FaFileAlt className="w-5 h-5" />
                </span>
                {item.content} 공시 데이터 분석
              </h3>
            ) : item.type === "subtitle" ? (
              <h2 className="text-xl font-semibold mt-4">
                {item.type === "subtitle" ? item.content : ""}
              </h2>
            ) : (
              <p className="text-gray-700">
                {item.type === "content" ? item.content : ""}
              </p>
            )
          )}
        </div>
        <div>
          {dartFinancialSummery.map((item, idx) =>
            item.type === "title" ? (
              <h3
                key={idx}
                className="font-bold text-2xl mb-4 mt-8 text-[#2A2C35] flex items-center"
              >
                <span className="bg-[#AF9BFF]/20 p-2 rounded-md mr-3 text-[#886BFB]">
                  <FaChartBar className="w-5 h-5" />
                </span>
                {item.content} 분석
              </h3>
            ) : item.type === "subtitle" ? (
              <h2 className="text-xl font-semibold mt-4">
                {item.type === "subtitle" ? item.content : ""}
              </h2>
            ) : (
              <p className="text-gray-700">
                {item.type === "content" ? item.content : ""}
              </p>
            )
          )}
        </div>
      </section>
    </div>
  );
}

export default PublicInformation;
