import { GetMyExperienceDetailResponse } from "@/types/mypage";

interface ExperienceInfoProps {
  experienceDetail: GetMyExperienceDetailResponse | undefined;
  isLoading: boolean;
}

function ExperienceInfo({ experienceDetail, isLoading }: ExperienceInfoProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">클라이언트</h3>
          <p className="font-medium">{experienceDetail?.experienceClient}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">경험 기간</h3>
          <p className="font-medium">
            {experienceDetail?.experienceStartDate} ~{" "}
            {experienceDetail?.experienceEndDate}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-sm font-medium text-gray-500 mb-2">담당 역할</h3>
        <p className="font-medium">{experienceDetail?.experienceRole}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-sm font-medium text-gray-500 mb-2">상세 내용</h3>
        <p className="font-medium">{experienceDetail?.experienceDetail}</p>
      </div>
    </div>
  );
}

export default ExperienceInfo;
