import { updateMyExperience } from "@/api/mypageApi";
import {
  GetMyExperienceDetailResponse,
  UpdateMyExperienceRequest,
} from "@/types/mypage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ExperienceEditProps {
  experienceDetail: GetMyExperienceDetailResponse | undefined;
  experienceId: number;
  page: number;
  onEditComplete: () => void;
}

function ExperienceEdit({
  experienceDetail,
  experienceId,
  page,
  onEditComplete,
}: ExperienceEditProps) {
  const [formData, setFormData] = useState<UpdateMyExperienceRequest>({
    experienceName: "",
    experienceDetail: "",
    experienceRole: "",
    experienceStartDate: "",
    experienceEndDate: "",
    experienceClient: "",
  });

  const queryClient = useQueryClient();

  // 경험 데이터 초기화
  useEffect(() => {
    if (experienceDetail) {
      setFormData({
        experienceName: experienceDetail.experienceName,
        experienceDetail: experienceDetail.experienceDetail,
        experienceRole: experienceDetail.experienceRole,
        experienceStartDate: experienceDetail.experienceStartDate,
        experienceEndDate: experienceDetail.experienceEndDate,
        experienceClient: experienceDetail.experienceClient,
      });
    }
  }, [experienceDetail]);

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

  // 경험 수정 API 호출
  const { mutate: updateExperience } = useMutation({
    mutationFn: async () => {
      const response = await updateMyExperience(experienceId, formData);
      return response.data;
    },
    onSuccess: () => {
      // 수정 성공 시, 경험 목록과 상세 정보 갱신
      queryClient.invalidateQueries({ queryKey: ["myExperienceList", page] });
      queryClient.invalidateQueries({
        queryKey: ["experienceDetail", experienceId],
      });
      onEditComplete(); // 수정 완료 후 편집 모드 종료
    },
    onError: (error) => {
      toast.error(`경험 수정 실패: ${error.message}`);
    },
  });

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateExperience();
  };

  return (
    <form
      id="experience-edit-form"
      onSubmit={handleSubmit}
      className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4"
    >
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <label className="text-sm font-medium text-gray-500 mb-2 block">
          제목 (경험명)
        </label>
        <input
          type="text"
          name="experienceName"
          value={formData.experienceName}
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
            name="experienceClient"
            value={formData.experienceClient}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-4">
          <label className="text-sm font-medium text-gray-500 mb-2 block">
            경험 기간
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              name="experienceStartDate"
              value={formData.experienceStartDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <input
              type="date"
              name="experienceEndDate"
              value={formData.experienceEndDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <label className="text-sm font-medium text-gray-500 mb-2 block">
          담당 역할
        </label>
        <input
          type="text"
          name="experienceRole"
          value={formData.experienceRole}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <label className="text-sm font-medium text-gray-500 mb-2 block">
          상세 내용
        </label>
        <textarea
          name="experienceDetail"
          value={formData.experienceDetail}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[150px]"
          required
        />
      </div>
    </form>
  );
}

export default ExperienceEdit;
