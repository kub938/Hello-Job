import { updateMyProject } from "@/api/mypageApi";
import {
  GetMyProjectDetailResponse,
  UpdateMyProjectRequest,
} from "@/types/mypage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProjectEditProps {
  projectDetail: GetMyProjectDetailResponse | undefined;
  projectId: number;
  page: number;
  onEditComplete: () => void;
}

function ProjectEdit({
  projectDetail,
  projectId,
  page,
  onEditComplete,
}: ProjectEditProps) {
  const [formData, setFormData] = useState<UpdateMyProjectRequest>({
    projectName: "",
    projectIntro: "",
    projectRole: "",
    projectSkills: "",
    projectStartDate: "",
    projectEndDate: "",
    projectDetail: "",
    projectClient: "",
  });

  const queryClient = useQueryClient();

  // 프로젝트 데이터 초기화
  useEffect(() => {
    if (projectDetail) {
      setFormData({
        projectName: projectDetail.projectName,
        projectIntro: projectDetail.projectIntro,
        projectRole: projectDetail.projectRole,
        projectSkills: projectDetail.projectSkills,
        projectStartDate: projectDetail.projectStartDate,
        projectEndDate: projectDetail.projectEndDate,
        projectDetail: projectDetail.projectDetail,
        projectClient: projectDetail.projectClient,
      });
    }
  }, [projectDetail]);

  // 입력 필드 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 프로젝트 수정 API 호출
  const { mutate: updateProject } = useMutation({
    mutationFn: async () => {
      const response = await updateMyProject(projectId, formData);
      return response.data;
    },
    onSuccess: () => {
      // 수정 성공 시, 프로젝트 목록과 상세 정보 갱신
      queryClient.invalidateQueries({ queryKey: ["myProjectList", page] });
      queryClient.invalidateQueries({ queryKey: ["projectDetail", projectId] });
      onEditComplete(); // 수정 완료 후 편집 모드 종료
    },
    onError: (error) => {
      toast.error(`프로젝트 수정 실패: ${error.message}`);
    },
  });

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("제출됨");
    updateProject();
  };

  return (
    <form
      id="project-edit-form"
      onSubmit={handleSubmit}
      className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4"
    >
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <label className="text-sm font-medium text-gray-500 mb-2 block">
          프로젝트명 (제목)
        </label>
        <input
          type="text"
          name="projectName"
          value={formData.projectName}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <label className="text-sm font-medium text-gray-500 mb-2 block">
            클라이언트
          </label>
          <input
            type="text"
            name="projectClient"
            value={formData.projectClient}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-4">
          <label className="text-sm font-medium text-gray-500 mb-2 block">
            프로젝트 기간
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              name="projectStartDate"
              value={formData.projectStartDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <input
              type="date"
              name="projectEndDate"
              value={formData.projectEndDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <label className="text-sm font-medium text-gray-500 mb-2 block">
          프로젝트 소개
        </label>
        <textarea
          name="projectIntro"
          value={formData.projectIntro}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
          required
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <label className="text-sm font-medium text-gray-500 mb-2 block">
          상세 내용
        </label>
        <textarea
          name="projectDetail"
          value={formData.projectDetail}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[150px]"
          required
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <label className="text-sm font-medium text-gray-500 mb-2 block">
          담당 역할
        </label>
        <textarea
          name="projectRole"
          value={formData.projectRole}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
          required
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <label className="text-sm font-medium text-gray-500 mb-2 block">
          사용 기술 (쉼표로 구분)
        </label>
        <input
          type="text"
          name="projectSkills"
          value={formData.projectSkills}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="React, TypeScript, Tailwind CSS"
          required
        />
        {formData.projectSkills && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.projectSkills.split(",").map((skill, index) => (
              <span
                key={index}
                className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm"
              >
                {skill.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}

export default ProjectEdit;
