import { getCorporateReportDetailResponse } from "@/types/coporateResearch";

function SWOTAnalysis({
  reportDetail,
}: {
  reportDetail?: getCorporateReportDetailResponse;
}) {
  if (!reportDetail) return null;
}

export default SWOTAnalysis;
