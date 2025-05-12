import { GetMyProjectDetailResponse } from "@/types/mypage";

interface ProjectInfoProps {
  projectDetail: GetMyProjectDetailResponse | undefined;
  isLoading: boolean;
}

function ProjectInfo({ projectDetail, isLoading }: ProjectInfoProps) {
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
          <p className="font-medium">{projectDetail?.projectClient}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            프로젝트 기간
          </h3>
          <p className="font-medium">
            {projectDetail?.projectStartDate} ~ {projectDetail?.projectEndDate}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          프로젝트 소개
        </h3>
        <p className="font-medium">{projectDetail?.projectIntro}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-sm font-medium text-gray-500 mb-2">상세 내용</h3>
        <p className="font-medium">{projectDetail?.projectDetail}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-sm font-medium text-gray-500 mb-2">담당 역할</h3>
        <p className="font-medium">{projectDetail?.projectRole}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-sm font-medium text-gray-500 mb-2">사용 기술</h3>
        <div className="flex flex-wrap gap-2">
          {projectDetail?.projectSkills
            ?.split(",")
            .map((skill: string, index: number) => (
              <span
                key={index}
                className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm"
              >
                {skill.trim()}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}

export default ProjectInfo;
